#!/usr/bin/env pwsh
# Claude Code Installer for Windows
# Usage: irm https://claude.ai/install.ps1 | iex

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Constants ────────────────────────────────────────────────────────────────
$PackageName    = '@anthropic-ai/claude-code'
$BinaryName     = 'claude'
$MinNodeVersion = 18
$NodeInstallUrl = 'https://nodejs.org/en/download/'

# ── Helpers ──────────────────────────────────────────────────────────────────
function Write-Header {
    Write-Host ''
    Write-Host '  Claude Code Installer' -ForegroundColor Cyan
    Write-Host '  ─────────────────────────────────────' -ForegroundColor DarkGray
    Write-Host ''
}

function Write-Step([string]$Message) {
    Write-Host "  » $Message" -ForegroundColor White
}

function Write-Success([string]$Message) {
    Write-Host "  ✓ $Message" -ForegroundColor Green
}

function Write-Warn([string]$Message) {
    Write-Host "  ! $Message" -ForegroundColor Yellow
}

function Write-Fail([string]$Message) {
    Write-Host "  ✗ $Message" -ForegroundColor Red
}

function Exit-WithError([string]$Message) {
    Write-Fail $Message
    Write-Host ''
    exit 1
}

# ── Platform check ───────────────────────────────────────────────────────────
function Test-Platform {
    if (-not $IsWindows -and $env:OS -ne 'Windows_NT') {
        Exit-WithError 'This installer is for Windows only. On macOS/Linux use: npm install -g @anthropic-ai/claude-code'
    }

    # Require PowerShell 5.1+
    if ($PSVersionTable.PSVersion.Major -lt 5) {
        Exit-WithError "PowerShell 5.1 or later is required. Your version: $($PSVersionTable.PSVersion)"
    }
}

# ── Node.js check ────────────────────────────────────────────────────────────
function Get-NodeVersion {
    try {
        $raw = & node --version 2>$null
        if ($raw -match 'v(\d+)') {
            return [int]$Matches[1]
        }
    } catch {}
    return $null
}

function Assert-Node {
    Write-Step 'Checking Node.js...'
    $ver = Get-NodeVersion
    if ($null -eq $ver) {
        Write-Fail 'Node.js is not installed.'
        Write-Host ''
        Write-Host "  Please install Node.js $MinNodeVersion or later from:" -ForegroundColor Yellow
        Write-Host "  $NodeInstallUrl" -ForegroundColor Cyan
        Write-Host ''
        Write-Host '  After installing Node.js, re-run this script.' -ForegroundColor Yellow
        Write-Host ''
        exit 1
    }
    if ($ver -lt $MinNodeVersion) {
        Write-Fail "Node.js $MinNodeVersion+ is required, but found v$ver."
        Write-Host ''
        Write-Host "  Please upgrade Node.js from: $NodeInstallUrl" -ForegroundColor Yellow
        Write-Host ''
        exit 1
    }
    Write-Success "Node.js v$ver found"
}

# ── npm check ────────────────────────────────────────────────────────────────
function Assert-Npm {
    Write-Step 'Checking npm...'
    try {
        $npmVer = & npm --version 2>$null
        Write-Success "npm $npmVer found"
    } catch {
        Exit-WithError 'npm is not available. Please reinstall Node.js from https://nodejs.org'
    }
}

# ── Install ──────────────────────────────────────────────────────────────────
function Install-ClaudeCode {
    Write-Step "Installing $PackageName globally..."
    try {
        & npm install -g $PackageName 2>&1 | ForEach-Object {
            # Surface errors but suppress normal npm noise
            if ($_ -match '^(npm warn|npm notice)') { return }
            Write-Host "    $_" -ForegroundColor DarkGray
        }
        if ($LASTEXITCODE -ne 0) {
            throw "npm exited with code $LASTEXITCODE"
        }
    } catch {
        Write-Host ''
        Write-Warn 'Installation failed. Retrying with --prefer-online...'
        & npm install -g --prefer-online $PackageName
        if ($LASTEXITCODE -ne 0) {
            Exit-WithError "Failed to install $PackageName. See output above for details."
        }
    }
    Write-Success "$PackageName installed"
}

# ── Verify ───────────────────────────────────────────────────────────────────
function Confirm-Install {
    Write-Step "Verifying $BinaryName command..."

    # Refresh PATH within this session so the new binary is findable
    $env:PATH = [System.Environment]::GetEnvironmentVariable('PATH', 'Machine') + ';' +
                [System.Environment]::GetEnvironmentVariable('PATH', 'User')

    try {
        $claudeVer = & $BinaryName --version 2>$null
        Write-Success "$BinaryName $claudeVer is ready"
    } catch {
        # Not fatal – npm global bin may not be on PATH yet
        Write-Warn "$BinaryName was installed but could not be found on PATH in this session."
        Write-Host ''
        Write-Host '  To fix this, add the npm global bin directory to your PATH.' -ForegroundColor Yellow
        $npmBin = & npm bin -g 2>$null
        if ($npmBin) {
            Write-Host "  npm global bin: $npmBin" -ForegroundColor Cyan
        }
        Write-Host ''
        Write-Host '  Then open a new terminal and run: claude' -ForegroundColor Yellow
    }
}

# ── Summary ──────────────────────────────────────────────────────────────────
function Write-Summary {
    Write-Host ''
    Write-Host '  ─────────────────────────────────────' -ForegroundColor DarkGray
    Write-Host '  Claude Code installed successfully!' -ForegroundColor Green
    Write-Host ''
    Write-Host '  Get started:' -ForegroundColor White
    Write-Host '    claude          - Start Claude Code' -ForegroundColor Cyan
    Write-Host '    claude --help   - Show help' -ForegroundColor Cyan
    Write-Host ''
    Write-Host '  Docs: https://docs.anthropic.com/en/docs/claude-code' -ForegroundColor DarkGray
    Write-Host ''
}

# ── Main ─────────────────────────────────────────────────────────────────────
Write-Header
Test-Platform
Assert-Node
Assert-Npm
Install-ClaudeCode
Confirm-Install
Write-Summary

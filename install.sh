#!/usr/bin/env bash
# Claude Code + Skills Installer for macOS / Linux
# Usage: curl -fsSL https://raw.githubusercontent.com/borahank-ui/borahank/master/install.sh | bash

set -euo pipefail

# ── Constants ────────────────────────────────────────────────────────────────
PACKAGE_NAME='@anthropic-ai/claude-code'
BINARY_NAME='claude'
MIN_NODE_VERSION=18
NODE_INSTALL_URL='https://nodejs.org/en/download/'
SKILLS_PACKAGE='antigravity-awesome-skills'

# ── Colours ──────────────────────────────────────────────────────────────────
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
RESET='\033[0m'

write_header() {
  echo ""
  echo -e "  ${CYAN}Claude Code Installer${RESET}"
  echo -e "  ${GRAY}─────────────────────────────────────${RESET}"
  echo ""
}

write_step()    { echo -e "  » $1"; }
write_success() { echo -e "  ${GREEN}✓ $1${RESET}"; }
write_warn()    { echo -e "  ${YELLOW}! $1${RESET}"; }
write_fail()    { echo -e "  ${RED}✗ $1${RESET}"; }

exit_with_error() {
  write_fail "$1"
  echo ""
  exit 1
}

# ── Node.js check ────────────────────────────────────────────────────────────
assert_node() {
  write_step "Checking Node.js..."

  if ! command -v node &>/dev/null; then
    write_fail "Node.js is not installed."
    echo ""
    echo -e "  ${YELLOW}Please install Node.js ${MIN_NODE_VERSION} or later from:${RESET}"
    echo -e "  ${CYAN}${NODE_INSTALL_URL}${RESET}"
    echo ""
    echo -e "  ${YELLOW}After installing Node.js, re-run this script.${RESET}"
    echo ""
    exit 1
  fi

  local ver
  ver=$(node --version | sed 's/v//' | cut -d. -f1)
  if [ "$ver" -lt "$MIN_NODE_VERSION" ]; then
    exit_with_error "Node.js ${MIN_NODE_VERSION}+ is required, but found v${ver}. Please upgrade: ${NODE_INSTALL_URL}"
  fi

  write_success "Node.js v${ver} found"
}

# ── npm check ────────────────────────────────────────────────────────────────
assert_npm() {
  write_step "Checking npm..."
  if ! command -v npm &>/dev/null; then
    exit_with_error "npm is not available. Please reinstall Node.js from https://nodejs.org"
  fi
  local npm_ver
  npm_ver=$(npm --version)
  write_success "npm ${npm_ver} found"
}

# ── Install Claude Code ───────────────────────────────────────────────────────
install_claude_code() {
  write_step "Installing ${PACKAGE_NAME} globally..."

  local install_flags="-g"
  # Use sudo on Linux if npm global prefix requires root
  local use_sudo=""
  local npm_prefix
  npm_prefix=$(npm config get prefix 2>/dev/null || true)
  if [ -n "$npm_prefix" ] && [ ! -w "$npm_prefix" ] && [ "$(id -u)" -ne 0 ]; then
    use_sudo="sudo"
  fi

  if ! $use_sudo npm install $install_flags "$PACKAGE_NAME" 2>&1 \
      | grep -v '^npm warn\|^npm notice'; then
    echo ""
    write_warn "Installation failed. Retrying with --prefer-online..."
    if ! $use_sudo npm install $install_flags --prefer-online "$PACKAGE_NAME"; then
      exit_with_error "Failed to install ${PACKAGE_NAME}. See output above for details."
    fi
  fi

  write_success "${PACKAGE_NAME} installed"
}

# ── Verify Claude Code ────────────────────────────────────────────────────────
confirm_install() {
  write_step "Verifying ${BINARY_NAME} command..."

  if command -v "$BINARY_NAME" &>/dev/null; then
    local claude_ver
    claude_ver=$("$BINARY_NAME" --version 2>/dev/null || true)
    write_success "${BINARY_NAME} ${claude_ver} is ready"
  else
    write_warn "${BINARY_NAME} was installed but could not be found on PATH in this session."
    echo ""
    echo -e "  ${YELLOW}To fix this, add the npm global bin directory to your PATH:${RESET}"
    local npm_bin
    npm_bin=$(npm bin -g 2>/dev/null || true)
    if [ -n "$npm_bin" ]; then
      echo -e "  ${CYAN}npm global bin: ${npm_bin}${RESET}"
      echo -e "  ${YELLOW}Add to your shell profile: export PATH=\"\$PATH:${npm_bin}\"${RESET}"
    fi
    echo ""
    echo -e "  ${YELLOW}Then open a new terminal and run: claude${RESET}"
  fi
}

# ── Install Skills / Plugins ──────────────────────────────────────────────────
install_skills() {
  write_step "Installing Claude Code skills (${SKILLS_PACKAGE})..."

  if ! command -v npx &>/dev/null; then
    write_warn "npx not found – skipping skills installation."
    return
  fi

  if npx "${SKILLS_PACKAGE}" --claude 2>&1 | grep -v '^npm warn\|^npm notice'; then
    write_success "Skills installed to ~/.claude/skills"
  else
    write_warn "Skills installation failed – you can install them manually later:"
    echo -e "  ${CYAN}npx ${SKILLS_PACKAGE} --claude${RESET}"
  fi
}

# ── Summary ───────────────────────────────────────────────────────────────────
write_summary() {
  echo ""
  echo -e "  ${GRAY}─────────────────────────────────────${RESET}"
  echo -e "  ${GREEN}Claude Code installed successfully!${RESET}"
  echo ""
  echo -e "  Get started:"
  echo -e "  ${CYAN}  claude          - Start Claude Code${RESET}"
  echo -e "  ${CYAN}  claude --help   - Show help${RESET}"
  echo ""
  echo -e "  ${GRAY}Docs: https://docs.anthropic.com/en/docs/claude-code${RESET}"
  echo ""
}

# ── Main ──────────────────────────────────────────────────────────────────────
write_header
assert_node
assert_npm
install_claude_code
confirm_install
install_skills
write_summary

workflow "Install and Run" {
  on = "push"
  resolves = ["Run"]
}

action "Filter Master" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Install" {
  needs = "Filter Master"
  uses = "actions/npm@master"
  args = "install"
}

action "Run" {
  needs = "Install"
  uses = "actions/npm@master"
  args = "run all"
  secrets = ["ACCESS_TOKEN_GITHUB"]
}

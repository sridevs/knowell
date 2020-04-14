#!/bin/sh

if ! hash nvm 2>/dev/null; then
  echo "installing nvm..."
  wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

  export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

  command -v nvm

fi

source ~/.bashrc

nvm install 6.11.1
nvm use 6.11.1

CREATE_LIBRARY_DEV="CREATE DATABASE library_dev /*\!40100 DEFAULT CHARACTER SET utf8 */;"
CREATE_LIBRARY_TEST="CREATE DATABASE library_test /*\!40100 DEFAULT CHARACTER SET utf8 */;"
CREATE_USER="CREATE USER knowell@localhost IDENTIFIED BY '';"
GRANT_PRIVILEGES_LIB_DEV="GRANT ALL PRIVILEGES ON library_dev.* TO 'knowell'@'localhost';"
GRANT_PRIVILEGES_LIB_TEST="GRANT ALL PRIVILEGES ON library_test.* TO 'knowell'@'localhost';"
ALTER_AUTH_METHOD="ALTER USER 'knowell'@'localhost' IDENTIFIED WITH mysql_native_password BY ''"
FLUSH_PRIVILEGES="FLUSH PRIVILEGES;"
# If /root/.my.cnf exists then it won't ask for root password
if [ -f /root/.my.cnf ]; then

  mysql -e "${CREATE_LIBRARY_DEV}"
  mysql -e "${CREATE_LIBRARY_TEST}"
  mysql -e "${CREATE_USER}"
  mysql -e "${GRANT_PRIVILEGES_LIB_DEV}"
  mysql -e "${GRANT_PRIVILEGES_LIB_TEST}"
  mysql -e "${FLUSH_PRIVILEGES}"

# If /root/.my.cnf doesn't exist then it'll ask for root password
else
  echo "Please enter root user MySQL password!"
  echo "Note: password will be hidden when typing"

  mysql --user=root --password=password -e "${CREATE_LIBRARY_DEV}"
  mysql --user=root --password=password -e "${CREATE_LIBRARY_TEST}"
  mysql --user=root --password=password -e "${CREATE_USER}"
  mysql --user=root --password=password -e "${GRANT_PRIVILEGES_LIB_DEV}"
  mysql --user=root --password=password -e "${GRANT_PRIVILEGES_LIB_TEST}"
  mysql --user=root --password=password -e "${ALTER_AUTH_METHOD}"
  mysql --user=root --password=password -e "${FLUSH_PRIVILEGES}"
fi

#!/bin/sh

CREATE_LIBRARY_DEV="CREATE DATABASE library_dev /*\!40100 DEFAULT CHARACTER SET utf8 */;"
CREATE_LIBRARY_TEST="CREATE DATABASE library_test /*\!40100 DEFAULT CHARACTER SET utf8 */;"
CREATE_USER="CREATE USER knowell@localhost IDENTIFIED BY '';"
GRANT_PRIVILEGES_LIB_DEV="GRANT ALL PRIVILEGES ON library_dev.* TO 'knowell'@'localhost';"
GRANT_PRIVILEGES_LIB_TEST="GRANT ALL PRIVILEGES ON library_test.* TO 'knowell'@'localhost';"
ALTER_AUTH_METHOD="ALTER USER 'knowell'@'localhost' IDENTIFIED WITH sudo mysql_native_password BY ''"
FLUSH_PRIVILEGES="FLUSH PRIVILEGES;"
# If /root/.my.cnf exists then it won't ask for root password
if [ -f /root/.my.cnf ]; then

  sudo mysql -e "${CREATE_LIBRARY_DEV}"
  sudo mysql -e "${CREATE_LIBRARY_TEST}"
  sudo mysql -e "${CREATE_USER}"
  sudo mysql -e "${GRANT_PRIVILEGES_LIB_DEV}"
  sudo mysql -e "${GRANT_PRIVILEGES_LIB_TEST}"
  sudo mysql -e "${FLUSH_PRIVILEGES}"

# If /root/.my.cnf doesn't exist then it'll ask for root password
else

  sudo mysql --user=root --password=password -e "${CREATE_LIBRARY_DEV}"
  sudo mysql --user=root --password=password -e "${CREATE_LIBRARY_TEST}"
  sudo mysql --user=root --password=password -e "${CREATE_USER}"
  sudo mysql --user=root --password=password -e "${GRANT_PRIVILEGES_LIB_DEV}"
  sudo mysql --user=root --password=password -e "${GRANT_PRIVILEGES_LIB_TEST}"
  sudo mysql --user=root --password=password -e "${ALTER_AUTH_METHOD}"
  sudo mysql --user=root --password=password -e "${FLUSH_PRIVILEGES}"
fi

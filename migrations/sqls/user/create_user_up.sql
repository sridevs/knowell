CREATE TABLE IF NOT EXISTS user (
  id INT(11) NOT NULL AUTO_INCREMENT,
  email VARCHAR(30) NOT NULL,
  enabled BOOL NOT NULL,
  isBorrower BOOL,
  isLibrarian BOOL,
  isAdmin BOOL,
  PRIMARY KEY (id)
);
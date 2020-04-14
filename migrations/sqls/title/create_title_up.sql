CREATE TABLE IF NOT EXISTS title (
  id INT(16) NOT NULL AUTO_INCREMENT,
  title VARCHAR(5000) NOT NULL,
  isbn VARCHAR(50) NOT NULL,
  author VARCHAR (200) NOT NULL,
  publisher VARCHAR(200) NULL,
  PRIMARY KEY (id)
);

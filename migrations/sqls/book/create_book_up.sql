CREATE TABLE IF NOT EXISTS book (
  id INT(11) NOT NULL AUTO_INCREMENT,
  title_id int(11) NOT NULL,
  tag_number VARCHAR (20) NOT NULL,
  available BOOL NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_title_id FOREIGN KEY (title_id) REFERENCES title (id)
);
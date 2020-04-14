CREATE TABLE IF NOT EXISTS transaction (
  id INT(11) NOT NULL AUTO_INCREMENT,
  book_id  int(11) NOT NULL,
  user_id int(11) NOT NULL,
  borrow_date DATETIME NOT NULL,
  return_date DATETIME,
  issue_by int(11) NOT NULL,
  return_by int(11),
  PRIMARY KEY (id),
  CONSTRAINT fk_book_id FOREIGN KEY (book_id) REFERENCES book (id)
);


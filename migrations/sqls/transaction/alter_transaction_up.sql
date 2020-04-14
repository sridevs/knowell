ALTER TABLE transaction
  ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES user (id);
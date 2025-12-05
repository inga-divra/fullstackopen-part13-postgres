/* Tehtävä 13.2 */

CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author text,
    url text NOT NULL,
    title text NOT NULL,
    likes integer DEFAULT 0
);

/* ADD BLOGS */

INSERT INTO blogs (author, url, title, likes)
VALUES ('Imran Teli', 'https://www.udemy.com/course/decodingdevops/', 'Decoding DevOps', 0);

INSERT INTO blogs (author, url, title, likes)
VALUES ('Brad Traversy', 'https://www.udemy.com/course/nextjs-from-scratch/', 'Next.js From Scratch', 0);

/* CHECK */
SELECT * FROM blogs;

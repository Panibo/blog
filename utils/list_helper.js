const dummy = (blogs) => {
  return 1;
};
const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};
const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;
  return blogs.reduce(
    (max, blog) => (blog.likes > max.likes ? blog : max),
    blogs[0]
  );
};
const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null;
  const authors = blogs.map((blog) => blog.author);

  let authorWithMostBlogs = authors[0];
  let maxBlogs = 0;
  authors.forEach((author) => {
    const authorCount = authors.filter((a) => a === author).length;
    if (authorCount > maxBlogs) {
      maxBlogs = authorCount;
      authorWithMostBlogs = author;
    }
  });
  return { author: authorWithMostBlogs, blogs: maxBlogs };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null;
  const authors = blogs.map((blog) => blog.author);

  let authorWithMostLikes = authors[0];
  let maxLikes = 0;
  authors.forEach((author) => {
    const likes = blogs
      .filter((blog) => blog.author === author)
      .reduce((sum, blog) => sum + blog.likes, 0);
    if (likes > maxLikes) {
      maxLikes = likes;
      authorWithMostLikes = author;
    }
  });
  return { author: authorWithMostLikes, likes: maxLikes };
};

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes };

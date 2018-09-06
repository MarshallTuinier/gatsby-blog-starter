const { createFilePath } = require('gatsby-source-filesystem');
const path = require('path');

// Below we create the needed slug to generate our URL for individual blog posts from markdown files

exports.onCreateNode = ({ node, getNode, boundActionCreators }) => {
  const { createNodeField } = boundActionCreators;
  if (node.internal.type === 'MarkdownRemark') {
    const slug = createFilePath({
      node,
      getNode,
      basePath: 'posts',
    });
    createNodeField({
      node,
      name: 'slug',
      value: `/posts${slug}`,
    });
  }
};

// Then we run a GQL query against our markdown files to dynamically create a page
// with the slug we created above

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators;
  return new Promise((resolve, reject) => {
    graphql(`
      {
        allMarkdownRemark {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
      }
    `).then(result => {
      //Iterate all of our nodes, then create pages for them
      result.data.allMarkdownRemark.edges.forEach(({ node }) => {
        createPage({
          path: node.fields.slug,
          // The 'component' option is essentially a template for the page we create
          component: path.resolve('./src/posts/PostPage.js'),
          context: {
            slug: node.fields.slug,
          },
        });
      });
      resolve();
    });
  });
};

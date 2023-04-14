//Here you will import route files and export them as used in previous labs

import gymRoutes from './gym.js';
import userRoutes from './user.js';
import commentRoutes from './comment.js';
import reviewRoutes from './review.js';

const constructorMethod = (app) => {
  //app.use('/posts', postRoutes);

  app.use('/gym', gymRoutes);
  app.use('/user', userRoutes);
  app.use('/comment', commentRoutes);
  app.use('/review', reviewRoutes);
  app.use('*', (req, res) => {
    res.status(200).render('homepage');
  });
};

export default constructorMethod;

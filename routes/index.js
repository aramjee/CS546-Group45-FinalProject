//Here you will import route files and export them as used in previous labs

import gymRoutes from './gym.js';
import userRoutes from './user.js';
import commentRoutes from './comment.js';
import reviewRoutes from './review.js';
import helpers from '../helpers.js';

const constructorMethod = (app) => {
  //app.use('/posts', postRoutes);

  app.use('/gym', gymRoutes);
  app.use('/user', userRoutes);
  app.use('/comment', commentRoutes);
  app.use('/review', reviewRoutes);
  app.use('*', (req, res) => {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    res.status(200).render('homepage', { userLoggedIn: userLoggedIn });
  });
};

export default constructorMethod;

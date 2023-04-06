// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link
import { Router } from 'express';
const router = Router();

router.route('/').get(async (req, res) => {
  //code here for GET
  res.render('homepage', { title: 'Gym Application' });
});

router.route('/list').get(async (req, res) => {
  //code here for GET
  res.render('gymList', {});
});

export default router;

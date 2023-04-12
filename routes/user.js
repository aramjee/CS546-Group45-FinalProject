// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link
import { Router } from 'express';
const router = Router();

router.route('/').get(async (req, res) => {
  //code here for GET
    res.render('homepage', { title: 'Gym Application' });
});

router.route('/login').get(async (req, res) => {
    //code here for GET
    res.render('login', { title: 'Gym User Login' });
});

router.route('/signup').get(async (req, res) => {
    //code here for GET
    res.render('signup', { title: 'Gym User Signup' });
});

router.route('/single/:id').get(async (req, res) => {
    //code here for GET
    res.render('homepage', { title: 'Gym Application' });
});

router.route('/single/update/:id').get(async (req, res) => {
    //code here for GET
    res.render('homepage', { title: 'Gym Application' });
});

router.route('/gymOwner/:id').get(async (req, res) => {
    //code here for GET
    res.render('homepage', { title: 'Gym Application' });
});

router.route('/single/update/:id').get(async (req, res) => {
    //code here for GET
    res.render('homepage', { title: 'Gym Application' });
});

export default router;

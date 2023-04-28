const middleware = {
    authenticated: (req, res, next) => {
        if (!req.session.userId) {
            res.status(401).redirect("/user/login");
            return;
        }
        next();
    },
}

export default middleware;
const User=require("../models/user.js");
module.exports.signup=async (req, res, next) => {
    try {
        let { username, email, password } = req.body.user;

        const newUser = new User({ username, email });

        const registeredUser = await User.register(newUser, password);

        // Auto login after signup
        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.login=async (req, res) => {
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    if(redirectUrl.includes("/reviews")){
        redirectUrl="/listings";
    }
    res.redirect(redirectUrl);
};
module.exports.renderLoginForm=(req, res) => {
    res.render("users/login.ejs");
};
module.exports.Logout=(req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged you out!");
        res.redirect("/listings");
    });
};
module.exports.renderSignupForm=(req, res) => {
    res.render("users/signup.ejs");
};
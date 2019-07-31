
const express = require('express');
const path = require('path');
const cookieparser = require('cookie-parser');
const session = require('express-session');
const FileStore = require('session-file-store') (session);
const hasher = require('pbkdf2-password') ();
const morgan = require('morgan');
const fs = require('fs'); 
const flash = require('connect-flash');
const multer = require('multer');
const User = require('./router/user.js'); 
const app = express();
const port = 5050;

app.use(express.urlencoded({
    extended: false
})); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public'))); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); 
app.engine('html', require('ejs').renderFile); 
app.use('/files', express.static(path.join(__dirname, 'uploads'))); 
app.use(flash());

app.use(cookieparser()); 
app.use(morgan('dev'));  
app.use((req,res,next) => {
    console.log(req.url);
    next();
})  
app.use(session({
    secret: '1A@W#E$E', 
    resave: false, 
    saveUninitialized: true, 
    store: new FileStore()
}))
app.use(function(req,res,next){
    res.locals.user = req.session.user;
    next();
});
app.use('/user', User);
app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });


var CarData;
var Cars;


app.get('/main', (req, res) => {
    res.render('./main.html');
});


app.post('/api/car_list', (req, res) => {
    CarData = fs.readFileSync('data/carlist.json');
    Cars = JSON.parse(CarData);
    res.json(JSON.stringify(Cars));
});


app.get('/sign', (req, res) => {
    res.render('./sign.html');
})


app.post('/signup', (req, res) => {

    let email = req.body.email;
    let password = req.body.password;
    let name = req.body.name;

    hasher({
        password: password
    }, (err, pass, salt, hash) => {
        if(err) { 
            console.log("ERR: ", err );
            res.redirect('/main')
        }

        let user = {
            password: hash,
            salt: salt,
            name: name,
            email: email
        }

        // 한 번만
        let user_data = fs.readFileSync('data/userlist.json');
        let users = JSON.parse(user_data);
        users[email] = user;
        fs.writeFileSync('data/userlist.json', JSON.stringify(users, null, 8)); 
        res.redirect('/login')
    })
})


app.get('/login', (req, res) => {
    res.render('./login.html');
})


app.post('/login_check', (req, res) => {
    let lonin_email = req.body.email;
    let lonin_password = req.body.password;

    if (fs.existsSync('data/userlist.json')) {
        let rawdata = fs.readFileSync('data/userlist.json');
        var Users = JSON.parse(rawdata);

        if ( Users[lonin_email] ) {
            hasher ({ 
                password: lonin_password,
                salt: Users[lonin_email].salt
            }, function (err, pass, salt, hash){
                    if (err) {
                        console.log('ERR: ' , err);
                    }
                    if (hash === Users[lonin_email].password) {
                        req.session.user = Users[lonin_email];
                        req.session.save( function(){
                            res.redirect('/main');
                        })
                    }
                    else {
                        console.log('error');
                        res.redirect('/login');
                        return;            
                    }
                });
        }
        else {
            console.log('error_사용자가 없습니다.');
            res.redirect('/login');
        }
    }
})


app.get('/logout', (req, res) => {
    req.session.destroy();       
    res.redirect('/main');
})


app.get('/admin', (req, res) => {
    res.render('./admin.html');
})


app.post('/registration', (req, res) => {
    CarData = fs.readFileSync('data/carlist.json');
    Cars = JSON.parse(CarData);
    Cars.push(req.body);
    fs.writeFileSync('data/carlist.json', JSON.stringify(Cars, null, 8));
    res.redirect('/admin');
})

app.get('/carlist', (req, res) => {
    res.render('./carlist.html');
})


app.post('/delete_data', (req, res) => {
    CarData = fs.readFileSync('data/carlist.json');
    Cars = JSON.parse(CarData);
    let indexs = Object.keys(req.body)

    for(num in indexs){
        let int_index = Number(indexs[num])
        Cars[int_index] = ''
    }
    
    let change_cars = Cars.filter(car => car != ''); 
    fs.writeFileSync('data/carlist.json', JSON.stringify(change_cars, null, 8));
    res.redirect('/carlist')
})



app.listen(port, () => {
   console.log('Server listening...' + port);
});

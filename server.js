var express=require("express");
let app= express();
let mysql2=require("mysql2");
let fileuploader=require("express-fileupload");
const nodemailer = require("nodemailer");
var cloudinary=require("cloudinary").v2;
require('dotenv').config();

// let config={
//     host:process.env.DB_HOST,
//     user:process.env.DB_USER,
//     password:process.env.DB_PWD,
//     database:process.env.DB_NAME,
//     dateStrings:true
// }

let config = process.env.DB_URL

app.use(express.urlencoded("true"));
app.use(fileuploader());
app.use(express.static("public"));


var mysql=mysql2.createConnection(config);
mysql.connect(function(err){
    if(err==null)
    {
        console.log("DB Connected");
    }
    else
     console.log(err.message);
})

app.listen(2024,function(req,resp){
    console.log("Server Connected");
})

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
});

app.get("/",function(req,resp){
    let path=__dirname+"/public/index.html";
    resp.sendFile(path);
})

app.get("/signup-process",function(req,resp)
{
    console.log(req.query);

    let email=req.query.txtEmail;
    let pwd=req.query.pwd;
    let utype=req.query.combo;
    
    mysql.query("insert into users values(?,?,?,1)",[email,pwd,utype],function(err)
    {
        if(err==null)
        {
            resp.send("SignedUp Successfullyy")
            
        }
        else
            resp.send(err.message);
    })
})

app.get("/login-process",function(req,resp)
{
    //console.log("login-process");
    let emaill=req.query.txtEmaill;
    let txtPwd=req.query.txtPwd;

    // console.log(emaill + " > " + txtPwd)
    

    mysql.query("select * from users where email=? and pwd=?",[emaill,txtPwd],function(err,result)
    {
        if(err!=null)
        {
            resp.send(err.message); return;
        }
        if(result.length==0)
        {
            resp.send("Invalid Id or Password");
            
            return;
        }
        if(result[0].status==1)
        {
            resp.send(result[0].utype); return;
        }
        else{
            resp.send("U R Blocked!!!"); return;
        }

    })
})
//    app.get("/infl",function(req,resp)
//    {
//     let path=__dirname+"/public/infl-dash.html";
//     resp.sendFile(path);
//    }) 

   app.get("/infl-profile",function(req,resp){
    let path=__dirname+"/public/infl-profile.html";
    resp.sendFile(path);
   })

   app.post("/save-infl-profile", async function(req,resp)
    {


    let filetosave="";

    if(req.files != null)
    {

        var filename = req.files.ppic.name;
        var path = __dirname + "/public/uploads/" + filename;

        req.files.ppic.mv(path)

        await cloudinary.uploader.upload(path)
        .then(function(result){

            filetosave = result.url;

        })

    }

    
       

    let iEmail=req.body.iEmail;
   
    let iName=req.body.iName;
    let iSelGen=req.body.iSelGen;
    let iSelDate=req.body.iSelDate;
    let iAddress=req.body.iAddress;
    let iCity=req.body.iCity;
    let iCont=req.body.iCont;
    
    let insta=req.body.insta;
    let yt=req.body.yt;
    let txtArea=req.body.txtArea;

    let ary=req.body.selFld;

    let str;
    if(Array.isArray(ary))
        {
         str="";
    for(i=0;i<ary.length;i++)
        {
            str+=ary[i]+",";
        }
    // console.log(str);
        }
        else
        str=ary;

    mysql.query("insert into iprofile values(?,?,?,?,?,?,?,?,?,?,?,?)",[iEmail,iName,iSelGen,iSelDate,iAddress,iCity,iCont,str,insta,yt,txtArea,filetosave],function(err)
    {
        if(err==null)
            {
                resp.send("Signed Up Successfullyy")
            }
            else
                resp.send(err.message);
    })
})

app.post("/save-client-profile",function(req,resp){
    let cEmail=req.body.cEmail;
    let cName=req.body.cName;
    let cState=req.body.cState;
    let cityC=req.body.cityC;
    let type=req.body.type;
    let contactC=req.body.contactC;

    mysql.query("insert into cprofile values(?,?,?,?,?,?)",[cEmail,cName,cState,cityC,type,contactC],function(err,result){
        if(err)
        {
            resp.send(err);
            console.log(err);
        }
        else
        resp.send("Submitted Successfully");
    })
})


app.get("/srch-client-profile",function(req,resp)
{
    let cEmail= req.query.cEmail;
   
    mysql.query("select * from cprofile where email=?",[cEmail],function(err,jsonClientAry){
        if(err!=null)
            {
                resp.send(err.message);
                return;

            }
        console.log(jsonClientAry);
            resp.send(jsonClientAry);//sending array of json object 0-1
    })

})


app.get("/post-event",function(req,resp){
     console.log("url");
    let evEmail=req.query.evEmail;
    let event=req.query.event;
    let evDate=req.query.evDate;
    let evTime=req.query.evTime;
    let evCity=req.query.evCity;
    let evVenue=req.query.evVenue

    mysql.query("insert into events values(?,?,?,?,?,?)",[evEmail,event,evDate,evTime,evCity,evVenue],function(err){
        if(err==null)
        {
           console.log("posted successfully");
        }
        else
       console.log(err.message);
    })

    
})

app.get("/srch-infl-profile",function(req,resp)
{
    let email= req.query.iEmail;
   
    mysql.query("select * from iprofile where email=?",[email],function(err,resultJsonAry){
        if(err!=null)
            {
                resp.send(err.message);
                return;

            }
        console.log(resultJsonAry);
            resp.send(resultJsonAry);//sending array of json object 0-1
    })

})

app.post("/update-infl-profile", async function(req,resp)
{
    //console.log(req.body);
    console.log(req.files);

    let filetosave="";

    if(req.files != null)
    {

        var filename = req.files.ppic.name;
        var path = __dirname + "/public/uploads/" + filename;

        req.files.ppic.mv(path)

        await cloudinary.uploader.upload(path)
        .then(function(result){

            filetosave = result.url;

        })

    }  
     else
     {
        filetosave=req.body.hdn;
        console.log("else");
        console.log(req.body.hdn);
     }
  
       
        let iEmail=req.body.iEmail;
       
        let iName=req.body.iName;
        let iSelGen=req.body.iSelGen;
        let iSelDate=req.body.iSelDate;
        let iAddress=req.body.iAddress;
        let iCity=req.body.iCity;
        let iCont=req.body.iCont;
        let selFld=req.body.selFld;
        let insta=req.body.insta;
        let yt=req.body.yt;
        let txtArea=req.body.txtArea;
        


mysql.query("update iprofile set iName=? , gender=?,dob=?,address=?,city=?,contact=?,field=?,insta=?,yt=?,other=? ,picpath=? where email=?",[iName,iSelGen,iSelDate,iAddress,iCity,iCont,selFld,insta,yt,txtArea,filetosave,iEmail],function(err,result)
{
    if(err==null)//no error
    {
           if(result.affectedRows>=1) 
               resp.send("Updated  Successfulllyyyy....");
            else
                resp.send("Invalid Email ID");
    }
else
    resp.send(err.message);
})
})

app.get("/update-pwd",function(req,resp)
{
    console.log(req.query);
   let setEmail= req.query.setEmail;
   let newPwd= req.query.newPwd;
   let oldPwd= req.query.oldPwd;

    mysql.query("select * from users where email=? and pwd=?",[setEmail,oldPwd],function(err,result)
    {
        console.log(result);
        if(result)
        {
            mysql.query("update users set pwd=? where email=?",[newPwd,setEmail],function(err,result){

                if(err==null){
                    resp.send("updated successfullly!!");
                }
                else
                {
                resp.send(err.message);
            console.log(err.message);
                }
            })
        }
        else
        resp.send("Wrong password");

    })
})
var mail;
app.get("/send-mail",function(req,resp)
{
    console.log("done");
    console.log(req.query);

    let retPwd;
    mail=req.query.mail;

    mysql.query("select * from users where email=?",[mail],function(err,result)
    {
        if(err==null)
        {
            //console.log("ok");
            console.log(result[0].pwd);
            retPwd=result[0].pwd;
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                   user: "mishabansal26@gmail.com",
            pass: 'knhr itnr cipk xbrw'
                }
            });

           
            var mailOptions = {
                from: 'mishabansal26@gmail.com',
                to: req.query.mail,
                subject: 'Forgot Password',
                //text: texxt2,
                html: "Your Password is"+" "+retPwd+"<br>Thanks for visiting Befluencer"

            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            

            resp.send("password retrieved");
        }
        else
        resp.send(err.message);
       
    })
})

app.get("/admin-dash",function(req,resp){

    let path=__dirname+"/public/admin-dash.html";
    resp.sendFile(path);
})

app.get("/user-manager",function(req,resp){
    let path=__dirname+"/public/admin-users.html";
    resp.sendFile(path);
})

app.get("/fetch-utype-users",function(req,resp){

    mysql.query("select * from users where utype=?",[req.query.utype],function(err,jsonArrayutype){
        if(err!=null)
        {
            resp.send(err.message);
            return;
        }
        else
        resp.send(jsonArrayutype);
    })
})
app.get("/fetch-all-users",function(req,resp){

  // console.log("API called");
  
    mysql.query("select * from users ",function(err,jsonArray){
        if(err)
        {
            console.log(err.message);
        }
        else
        {
            resp.send(jsonArray);

        }
        // if(err!=null)
        // {
        //     resp.send(err.message);
        //     return;
        // }
        // else
        // resp.send(jsonArray);
    })
})

app.get("/del-users",function(req,resp){
    mysql.query("delete from users where email=?",[req.query.email],function(err,result){
        if(err==null)
        {
           // resp.send("deleted successfully");
            console.log("deleted successfully");
        }
        else
        resp.send(err.message);
    })
})

app.get("/block-users",function(req,resp){
    console.log(req.query.email);
    mysql.query("update users set status=0 where email=?",[req.query.email],function(err,result){
        if(err)
        {
            resp.send(err.message);

        }
        else
        {
            //resp.send("blocked successfully");
            console.log("blocked successfully");
        }
            })
})
app.get("/unblock-users",function(req,resp){
    console.log(req.query.email);
    mysql.query("update users set status=1 where email=?",[req.query.email],function(err,result){
        if(err)
        {
            resp.send(err.message);

        }
        else
        {
            //resp.send("unblocked successfully");
            console.log("unblocked successfully");
        }
            })
})

app.get("/infl-console",function(req,resp){
    let path=__dirname+"/public/infl-console.html";
    resp.sendFile(path);
})

app.get("/fetch-all-infl",function(req,resp){
   
    mysql.query("select * from iprofile",function(err,jsoninflArray){
        if(err==null)
        {
           resp.send(jsoninflArray);
        }
        else
        {
            console.log(err.message)
            resp.send(err.message);
        }
    })
})

app.get("/influ-finder",function(req,resp){

    let path=__dirname+"/public/infl-finder.html"
    resp.sendFile(path);
})



app.get("/show-some-cities",function(req,resp){
    console.log(req.query.field);
    mysql.query("select distinct city from iprofile where field like ?",["%"+req.query.field+"%"],function(err,jsonsomecityArray)
    {
        // console.log(jsonsomecityArray);
        if(err)
        {
            console.log(err.message)
        }
        else
        {

            resp.send(jsonsomecityArray);
            console.log(JSON.stringify(jsonsomecityArray));
        }

    })
})

app.get("/find-details",function(req,resp)
{
    // console.log("API");
  
    mysql.query("select * from iprofile where field like ? && city like ?",["%"+req.query.field+"%", "%"+req.query.city+"%"],function(err,jsonDetailsAry){
        if(err)
        {
            console.log(err.message);
        }
        else
        resp.send(JSON.stringify(jsonDetailsAry));
     console.log(JSON.stringify(jsonDetailsAry));
    })
})

app.get("/find-by-name",function(req,resp)
{
    // console.log("API");
  
    mysql.query("select * from iprofile where iname like ? ",["%"+req.query.iname+"%"],function(err,jsonDetailsAry){
        if(err)
        {
            console.log(err.message);
        }
        else
        resp.send(JSON.stringify(jsonDetailsAry));
     console.log(JSON.stringify(jsonDetailsAry));
    })
})

app.get("/save-cprofile",function(req,resp){

    // console.log("API");

    mysql.query("insert into cprofile(?,?,?,?,?,?)",[req.query.cEmail,req.query.cName,req.query.selState,req.query.cityC,req.query.type,req.query.contactC],function(err,result)
    {
        if(err)
        {
            console.log(err.message);
        }
        else
        resp.send("signed up successfully");
    console.log("Signed up successfully");
    })
})
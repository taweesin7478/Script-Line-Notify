const axios = require('axios');
// const { response } = require('express');
const querystring = require('querystring');
const fs = require('fs');
const yaml = require('js-yaml')

try {
    const fileContents = fs.readFileSync('./info.yaml', 'utf8');
    const info = yaml.load(fileContents);
    LoginOneid(info.USER, info.PASS)
}
catch (error) {
    console.log(">> error");
    console.log(error);
}

async function LoginOneid (username, password) {
    try {
        const fileContents = fs.readFileSync('./info.yaml', 'utf8');
        const info = yaml.load(fileContents);
        var data = {
            grant_type: 'password',
            client_id: info.ONEID_CLIENT_ID,
            client_secret: info.ONEID_CLIENT_SECRET,
            username: username,
            password: password,
        }
        const login = await axios.post(info.ONEID_API_LOGIN, data)
        if (login.data.result === 'Success') {
            const account_id = login.data.account_id
            const access_token = login.data.access_token
            getonebox(access_token, account_id)
        } else {
            return { error: login.data.result }
        }
    } catch (error) {
        console.log("LoginOneid error")
        console.log(error)
        return error
    }
}

async function getonebox (accesstoken, oneid) {
    const fileContents = fs.readFileSync('./info.yaml', 'utf8');
    const info = yaml.load(fileContents);
    const header = { headers: { Authorization: info.ONEBOX_AUTH } }
    try {
        const oneidToken = { accesstoken: accesstoken }
        const getAccountOnebox = await axios.post(
            info.ONEBOX_GETACCOUNT,
            oneidToken,
            header
        )
        if (getAccountOnebox.data.status === 'OK') {
            const dataonebox = getAccountOnebox.data.result
        } else {
            return { status: 'error' }
        }
    } catch (error) {
        console.log("getonebox error")
        return error
    }
}

async function sendMessage (message) {
    const fileContents = fs.readFileSync('./info.yaml', 'utf8');
    const info = yaml.load(fileContents);
    var lineNotifyEndPoint = info.lineNotify;
    var accessToken = info.token_line;

    var formData =
        querystring.stringify({
            "message": message
        });
    var header = { headers: { "Authorization": "Bearer " + accessToken } }
    try {
        await axios.post(
            lineNotifyEndPoint,
            formData,
            header
        ).then(resp => {
            console.log("Sending message completed.");
        })
            .catch(error => {
                console.log(error);
            });
    }
    catch (error) {
        console.log(error.name + "：" + error.message);
        return;
    }
}
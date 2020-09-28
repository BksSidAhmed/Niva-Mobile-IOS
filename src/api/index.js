export const getToken = async (email,password) => {
    const url = 'https://test.portail-e-rh.niva.tm.fr/api/login_check';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept' : "application/json",
                'Content-Type' : "application/json",
            },
            body: JSON.stringify({
	            username: email,
                password: password
            })
        });
        const statusCode = response.status;
        return await Promise.all([statusCode,response.json()]);

    } 
    catch(error) 
    {
        return console.error(error);
    }
}

export const postAction = async (token,indicateurTemps,email,date,heure,button,lat,lng) => {
    const url = 'https://test.portail-e-rh.niva.tm.fr/api/action';
    try 
    {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept : "application/json",
                'Content-Type' : "application/json",
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                indicateurTemps : indicateurTemps,
                email : email,
	            date: date,
                heure: heure,
                button : button,
                lat : lat,
                lng : lng
            })
        });
        const statusCode = response.status;
        return await Promise.all([statusCode,response.json()]);
    } 
    catch(err) 
    {
        return console.error(err);
    }
}

export const getUser = async (token, email) => {
    const url = 'https://test.portail-e-rh.niva.tm.fr/api/getUser';
    try 
    {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept' : "application/json",
                'Content-Type' : "application/json",
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                email : email,
            })
        });
        const statusCode = response.status;
        return Promise.all([statusCode,response.json()]);
    }
    catch(err)
    {
        return console.error(err);
    }
}

export const getIco = async (token,ico) => {
    const url = 'https://test.portail-e-rh.niva.tm.fr/api/images/'+ico+'.png';
    try 
    {   
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type' : "application/json",
                'Authorization': 'Bearer ' + token,
            },
        });
        const statusCode = response.status;
        return Promise.all([statusCode,response.json()]);
    }
    catch(err)
    {
        return console.error(err);
    }
}

export const postPassword = async (token,email) => {
    const url = 'https://test.portail-e-rh.niva.tm.fr/api/edit/password';
    try 
    {   
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type' : "application/json",
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({
                email : email,
            })
        });
        const statusCode = response.status;
        return Promise.all([statusCode,response.json()]);
    }
    catch(err)
    {
        return console.error(err);
    }
}
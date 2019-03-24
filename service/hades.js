Axios=require('axios');


module.exports={
    getPart:  function (event,type) {
        return new Promise(async function(resolve,reject){
            try{
                emails=[]
                response=await Axios.post(`${process.env.BASEURL}api/v1/simple-projection/project-${type}`, {event})
                response.data.rs.forEach(element => {
                    emails.push(element.email)
                });
                resolve(emails)
            } catch(e){
                reject(e.response.data.error)
            }
        })
        
    }
}
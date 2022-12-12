var dateUTC = new Date();
var dateUTC = dateUTC.getTime() 
var dateIST = new Date(dateUTC);
//date shifting for IST timezone (+5 hours and 30 minutes)
dateIST.setHours(dateIST.getHours() + 5); 
dateIST.setMinutes(dateIST.getMinutes() + 30);

export default function getISTDate () {
    return dateIST
}

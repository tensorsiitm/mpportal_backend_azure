const admins = {
    "r716Mh2NpPffubTQ99vAYXmjZan1" : "FASEEH",
    "4yrKXJFfZAUjE230QjRY0tXhlr53" : "HASHIN",
    "yDt4ZRocddOlizd6viToL5IpSX63" :"AFEEF"

}

export default function adminAuth(uuid) {
    if (uuid in admins) {
        return true
    } else {
        return false
    }
}
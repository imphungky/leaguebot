const axiosConfig = require('./axiosConfig.js');
const {regions} = require('./config.json');
async function getPatch() {
    return axiosConfig.get(`http://ddragon.leagueoflegends.com/api/versions.json`)
    .then((response) => {
        let patch = response.data[0];
        let url_patch = patch.split('.');
        url_patch.pop();
        url_patch = url_patch.join('-');
        console.log(patch);
        return {patch: patch, url_patch: url_patch};
    })
    .catch((err) => {
        console.log(err);
        return {};
    });
}

async function getuserInfo(summoner_name) {
    return axiosConfig.get(`${regions.NA}/lol/summoner/v4/summoners/by-name/${summoner_name}`)
    .then((response) => {
        const summoner_info = response.data;
        return summoner_info;
    });
}

async function getchampmastery(uid, max) {
    return axiosConfig.get(`${regions.NA}/lol/champion-mastery/v4/champion-masteries/by-summoner/${uid}`)
    .then((response) => {
        return response.data.slice(0, max);
    });
}

async function champIDtoName(id) {
    return axiosConfig.get(`http://ddragon.leagueoflegends.com/cdn/11.2.1/data/en_US/champion.json`)
    .then(response => {
        const champlist = response.data.data;
        let name = Object.values(champlist).filter(champion => champion.key == id);
        if(name.length) {
            return {name: name[0].name, image: name[0].image.full, title: name[0].title};
        }
        return 'error';
    })
    .catch((err) => {
        console.log(err);
    });
}

module.exports = {
    getPatch: getPatch,
    getuserInfo: getuserInfo,
    getchampmastery: getchampmastery,
    champIDtoName: champIDtoName
};


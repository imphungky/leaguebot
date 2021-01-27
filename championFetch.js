const { default: axios } = require('axios');
const axiosConfig = require('./axiosConfig.js');
const {regions} = require('./config.json');

function SStoMS(seconds) {
    let minutes = Math.floor(seconds / 60);
    return {minutes: minutes, seconds: seconds - minutes * 60};
}


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

async function champNametoID(name, patch) {
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

async function champIDtoName(id, patch) {
    return axiosConfig.get(`http://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`)
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

async function getMatchHistory(uid) {
    return axiosConfig.get(`${regions.NA}/lol/match/v4/matchlists/by-account/${uid}`)
    .then(response => {
        return response.data;
    })
    .catch((err) => {
        console.log(err);
    })
}

async function getMatchDetails(matchid, username) {

    /**
     * End point returns data object on success
     * Fields that are relevant are: 
     *     participantIdentities - [Objects] return player_id if player.accountId == ours
     *     participants - after retrieving participant ID we match it within this list to get details
     *     gameDuration - 
     *     We won't be able to display the items currently so the only relevant fields we need from the returned object is:
     *         stats.kills, stats.deaths, stats.assists, stats.win, 
     */


    return axiosConfig.get(`${regions.NA}/lol/match/v4/matches/${matchid}`)
    .then((response) => {
        const match_info = response.data;
        let gameDuration = SStoMS(match_info.gameDuration);
        let [player] = match_info.participantIdentities.filter((participant) => participant.player.summonerName == username);
        let [player_details] = match_info.participants.filter((participant) => participant.participantId == player.participantId);
        return {
            win: player_details.stats.win, 
            kills: player_details.stats.kills,
            assists: player_details.stats.assists, 
            deaths: player_details.stats.deaths,
            length: gameDuration
        };
        
    })
}

module.exports = {
    getPatch: getPatch,
    getuserInfo: getuserInfo,
    getchampmastery: getchampmastery,
    champIDtoName: champIDtoName,
    champNametoID: champNametoID,
    getMatchHistory: getMatchHistory,
    getMatchDetails: getMatchDetails
};


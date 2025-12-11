/*
 * Script Name: TW Report Cleaner
 * Version: v1.0.0
 * Last Updated: 2025-12-11
 * Author: QuoVadis
 * Author URL: https://discordapp.com/users/668537674193174549
 * Author Contact: quo.vadis. (Discord)
 * Approved: Not Approved Yet
 * Approved Date: Not Approved Yet
 * Mod: 
 */

/*--------------------------------------------------------------------------------------
 * This script can NOT be cloned and modified without permission from the script author.
 --------------------------------------------------------------------------------------*/

// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;
if (typeof config !== 'object') config = null;

// Script Config
window.scriptConfig = {
    scriptData: {
        prefix: 'TWReportCleaner',
        name: 'TW Report Cleaner',
        version: 'v1.0.0',
        author: 'QuoVadis',
        authorUrl: 'https://discordapp.com/users/668537674193174549',
        helpLink: '',
    },
    translations: {
        pt_PT: {
            'TW Report Cleaner': 'TW Limpa-Relatórios',
            'Delete Selected': 'Apagar Selecionados',
            'Close': 'Fechar',
            'Deletion Complete': 'Limpeza Concluída!',
            attack: 'Ataques',
            defense: 'Defesa',
            support: 'Apoio',
            trade: 'Comércio',
            event: 'Eventos',
            other: 'Misc',
            Help: 'Ajuda',            
            'Script is not allowed to be used on this TW market!':
            'Script não está autorizado a ser usado nesta região!',
            'There was an error!': 'Houve um erro!',
            'You need to provide a configuration to run this script!':
            'Necessitas de providenciar uma configuração para correr este script!',
        },
        en_DK: {
            'TW Report Cleaner': 'TW Report Cleaner',
            'Delete Selected': 'Delete Selected',
            'Close': 'Close',
            'Deletion Complete': 'Cleanup Finished!',
            attack: 'Attack',
            defense: 'Defense',
            support: 'Support',
            trade: 'Trade',
            event: 'Event',
            other: 'Other',
            Help: 'Help',
            'Script is not allowed to be used on this TW market!':
            'Script is not allowed to be used on this TW market!',
            'There was an error!': 'There was an error!',
            'You need to provide a configuration to run this script!':
            'You need to provide a configuration to run this script!'
        }
    },
    allowedMarkets: ['en','es'],
    allowedScreens: [],
    allowedModes: [],
    isDebug: DEBUG
};

const STORAGE_KEY = 'twReportCleanerPrefs';
const defaultCategories = ['trade','event','other'];
const AllCategories = ['attack','defense','support','trade','event','other'];
const REQUIRED_SCREEN = 'report';

 $.getScript(`https://twscripts.dev/scripts/twSDK.js?url=${document.currentScript.src}`, async function () {
    await twSDK.init(scriptConfig);
    if (!isOnReportScreen()) {
        window.location.href = `/game.php?screen=${REQUIRED_SCREEN}`;
        return;
    }
    BuildUI();
});

function isOnReportScreen() {
    const url = new URL(window.location.href);
    return url.searchParams.get('screen') === REQUIRED_SCREEN;
}

function getPrefs() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if(!saved) return defaultCategories;
    try { return JSON.parse(saved); } catch(e) { return defaultCategories; }
}

function savePrefs(categories) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

async function runCleaner(categories) {
    for(let mode of categories){
        try{
            const h = document.querySelector('input[name=h]')?.value;
            if(!h) continue;
            const url = `/game.php?screen=report&action=del_all&mode=${mode}&group_id=-1&h=${h}`;
            await fetch(url,{method:'GET',credentials:'same-origin'});
        }catch(e){
            UI.ErrorMessage(`${twSDK.tt('Deletion Complete')} - Erro ao apagar ${twSDK.tt(mode)}`);
        }
    }
    UI.SuccessMessage(twSDK.tt('Deletion Complete'));
}

function BuildUI() {
    if(!window.twSDK) { console.error('[TWReportCleaner] twSDK não disponível'); return; }
    if(document.querySelector('#twReportCleanerWidget')) return;

    const selected = getPrefs();
    let html = '<table class="ra-table ra-table-v2" width="100%"><tbody>';
    AllCategories.forEach(cat => {
        const isChecked = selected.includes(cat) ? 'checked' : '';
        html += renderCategoryRow(cat, isChecked);
    });
    html += '</tbody></table>';
    html += `<div class="ra-mb15">
                <a href="javascript:void(0);" id="twRunCleaner" class="btn btn-confirm">${twSDK.tt('Delete Selected')}</a>
                <a href="javascript:void(0);" id="twCloseCleaner" class="btn">${twSDK.tt('Close')}</a>
                </div>`;

    const style = `.ra-table input[type=checkbox]{margin:0;}`;

    twSDK.renderFixedWidget(html, 'twReportCleanerWidget', 'tw-report-cleaner-widget', style);

    const widget = document.getElementById('twReportCleanerWidget');

    // EVENT LISTENERS
    //      Checkbox Change
    widget.querySelectorAll('input[type=checkbox]').forEach(chk=>{
        chk.addEventListener('change',()=>{
            const checked = Array.from(widget.querySelectorAll('input[type=checkbox]:checked')).map(i=>i.value);
            savePrefs(checked);
        });
    });
    //      Row Click Toggle
    widget.querySelectorAll('.twCleanerRow').forEach(row => {
        row.addEventListener('click', e => {
            if (e.target.tagName === 'INPUT') return;

            const chk = row.querySelector('input[type=checkbox]');
            chk.checked = !chk.checked;

            const checked = Array.from(widget.querySelectorAll('input[type=checkbox]:checked')).map(i => i.value);
            savePrefs(checked);
        });
    });
    //      Run Cleaner
    widget.querySelector('#twRunCleaner').addEventListener('click', ()=>{
        const checked = Array.from(widget.querySelectorAll('input[type=checkbox]:checked')).map(i=>i.value);
        runCleaner(checked);
        widget.querySelector('#twCloseCleaner').click()
    });
    //      Close Widget
    widget.querySelector('#twCloseCleaner').addEventListener('click', ()=>widget.remove());
    //      Keyboard Shortcuts
    widget.addEventListener('keydown', e => {
        if (e.key === 'Escape') widget.querySelector('#twCloseCleaner').click();
        if (e.key === 'Enter') widget.querySelector('#twRunCleaner').click();
    });
};
function renderCategoryRow(cat, isChecked) {
    return `
        <tr class="twCleanerRow">
            <td><input type="checkbox" value="${cat}" ${isChecked}></td>
            <td style="width:100%">${twSDK.tt(cat)}</td>
        </tr>
    `;
}
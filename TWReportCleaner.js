(function() {
    'use strict';

    window.scriptConfig = {
        scriptData: {
            prefix: 'TWReportCleaner',
            name: 'TW Report Cleaner',
            version: 'v1.0.0',
            author: 'QuoVadis',
            authorUrl: 'https://discordapp.com/users/668537674193174549',
            description: 'Cleans up your reports based on selected categories.',
            longDescription: 'This script allows you to easily delete reports in Tribal Wars based on selected categories such as attacks, defenses, support, trade, events, and others. Simply select the categories you want to delete and run the cleaner.',
            howToUse: 'Open the TW Report Cleaner widget, select the report categories you wish to delete, and click "Delete Selected". The script will then remove all reports in the chosen categories.',
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
                UI.ErrorMessage(`${twSDK.tt('Deletion Complete')} - Erro ao apagar ${twSDK.tt(`categories.${mode}`)}`);
            }
        }
        UI.SuccessMessage(twSDK.tt('Deletion Complete'));
    }

    function openWidget() {
        if(!window.twSDK) { console.error('[TWReportCleaner] twSDK não disponível'); return; }
        if(document.querySelector('#twReportCleanerWidget')) return;

        const selected = getPrefs();
        let html = '<table class="ra-table ra-table-v2" width="100%"><tbody>';

        AllCategories.forEach(cat => {
            const isChecked = selected.includes(cat) ? 'checked' : '';
            const catName = twSDK.tt(cat);
            html += `<tr class="twCleanerRow">
                <td><input type="checkbox" value="${cat}" ${isChecked}></td>
                <td style="width:100%">${catName}</td>
             </tr>`;
        });

        html += '</tbody></table>';
        html += `<div style="margin-top:5px;">
                    <a href="javascript:void(0);" id="twRunCleaner" class="btn btn-confirm">${twSDK.tt('Delete Selected')}</a>
                    <a href="javascript:void(0);" id="twCloseCleaner" class="btn">${twSDK.tt('Close')}</a>
                 </div>`;

        const style = `.ra-table input[type=checkbox]{margin:0;}`;

        twSDK.renderFixedWidget(html, 'twReportCleanerWidget', 'tw-report-cleaner-widget', style);

        const widget = document.getElementById('twReportCleanerWidget');

        widget.querySelectorAll('input[type=checkbox]').forEach(chk=>{
            chk.addEventListener('change',()=>{
                const checked = Array.from(widget.querySelectorAll('input[type=checkbox]:checked')).map(i=>i.value);
                savePrefs(checked);
            });
        });

        widget.querySelectorAll('.twCleanerRow').forEach(row => {
            row.addEventListener('click', e => {
                if (e.target.tagName === 'INPUT') return;

                const chk = row.querySelector('input[type=checkbox]');
                chk.checked = !chk.checked;

                const checked = Array.from(widget.querySelectorAll('input[type=checkbox]:checked')).map(i => i.value);
                savePrefs(checked);
            });
        });

        widget.querySelector('#twRunCleaner').addEventListener('click', ()=>{
            const checked = Array.from(widget.querySelectorAll('input[type=checkbox]:checked')).map(i=>i.value);
            runCleaner(checked);
            widget.querySelector('#twCloseCleaner').click()
        });
        widget.querySelector('#twCloseCleaner').addEventListener('click', ()=>widget.remove());

        widget.addEventListener('keydown', e=>{
            if(e.key==='Escape'){
                widget.querySelector('#twCloseCleaner').click();
            }
        });

        widget.addEventListener('keydown', e=>{
            if(e.key==='Enter'){
                widget.querySelector('#twRunCleaner').click();
                e.preventDefault();
            }
        });
        widget.tabIndex=0;
        widget.focus();
    }
    if(!twSDK.isMarketAllowed() || !isOnReportScreen()) {
        UI.ErrorMessage('');
        
        if (!isOnReportScreen()) {
            window.location.href = `/game.php?screen=${REQUIRED_SCREEN}`;
        }
        else {
        
        }
    }

    $.getScript(`https://twscripts.dev/scripts/twSDK.js`, async function () {
        try {
            await twSDK.init(scriptConfig);
        } catch (e) {
            console.error('[TWReportCleaner] twSDK init failed', e);
        }
        openWidget();
    });
})();

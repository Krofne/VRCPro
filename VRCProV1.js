// ==UserScript==
// @name         Show's the groups creator and user info.
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  VRCPro V1
// @author       Jake Krofne & VT
// @match        https://vrchat.com/home/group/*
// @match        https://vrchat.com/home/user/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Fetch data from the API and handle response
    function fetchData(url, callback) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(callback)
            .catch(() => {});
    }

    // Function to inject the owner ID link
    function injectOwnerId(groupId) {
        fetchData(`https://vrchat.com/api/1/groups/${groupId}?includeRoles=true&purpose=group`, (data) => {
            const ownerId = data.ownerId;
            if (ownerId) {
                const ownerLink = document.createElement('a');
                ownerLink.href = `https://vrchat.com/home/user/${ownerId}`;
                ownerLink.textContent = `Owner: ${ownerId}`;
                ownerLink.style.cssText = 'color: white; margin-left: 10px;';
                const targetDiv = document.querySelector('.css-1no6rdg.e1kortvj4');
                if (targetDiv && !document.querySelector('.ownerId-link')) {
                    ownerLink.classList.add('ownerId-link');
                    targetDiv.appendChild(ownerLink);
                }
            }
        });
    }

    // Function to inject the join date into the user profile
    function injectJoinDate(userId) {
        fetchData(`https://vrchat.com/api/1/users/${userId}`, (data) => {
            const joinDate = data.date_joined;
            if (joinDate && !document.querySelector('.join-date')) {
                const joinDateElement = document.createElement('p');
                joinDateElement.textContent = `Joined on: ${joinDate}`;
                joinDateElement.className = 'join-date';
                joinDateElement.style.cssText = 'color: white; margin: 5px 0 0 2px; font-size: 16px;';
                const targetDiv = document.querySelector('.tw-flex.tw-flex-col.md\\:tw-flex-row.tw-py-9');
                if (targetDiv) targetDiv.appendChild(joinDateElement);
            }
        });
    }

    // MutationObserver to detect changes in the DOM
    const observer = new MutationObserver(() => {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/group/')) {
            injectOwnerId(currentPath.split('/').pop());
        } else if (currentPath.includes('/user/')) {
            injectJoinDate(currentPath.split('/').pop());
        }
    });

    // Start observing the document
    observer.observe(document.body, { childList: true, subtree: true });
})();

// If nothing shows refresh the page

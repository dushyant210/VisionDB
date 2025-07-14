let allEntries = [];
let currentPage = 1;
const rowsPerPage = 17;
let topSellers = []; // Store Top Sellers list

function formatEpochTime(epochSeconds) {
    if (isNaN(epochSeconds) || epochSeconds === 0) return 'N/A';
    const date = new Date(epochSeconds * 1000);
    const options = {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    };
    const formatter = new Intl.DateTimeFormat('en-IN', options);
    const parts = formatter.formatToParts(date);
    const dayName = parts.find(p => p.type === 'weekday')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const year = parts.find(p => p.type === 'year')?.value;
    const hour = parts.find(p => p.type === 'hour')?.value;
    const minute = parts.find(p => p.type === 'minute')?.value;
    const dayPeriod = parts.find(p => p.type === 'dayPeriod')?.value;
    return `${dayName}, ${day}-${month}-${year} ${hour}:${minute} ${dayPeriod}`;
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function showError(message) {
    const alert = document.getElementById('errorAlert');
    alert.textContent = message;
    alert.style.display = 'block';
    setTimeout(() => alert.style.display = 'none', 7000);
}

function renderTable(page) {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const generatedByFilter = document.getElementById('generatedByFilter').value;
    const tableBody = document.getElementById('tableBody');
    const mobileLicenseList = document.getElementById('mobileLicenseList');
    tableBody.innerHTML = '';
    mobileLicenseList.innerHTML = '';

    let filteredEntries = allEntries.filter(entry => {
        if (!entry || entry.length < 11) return false;
        const rowText = entry.map(field => (field || '').toLowerCase()).join(' ');
        const matchesSearch = searchInput === '' || rowText.includes(searchInput);
        const matchesGeneratedBy = generatedByFilter === '' || entry[10] === generatedByFilter;
        return matchesSearch && matchesGeneratedBy;
    });

    const totalPages = Math.ceil(filteredEntries.length / rowsPerPage);
    currentPage = Math.min(page, totalPages || 1);

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const rowsToShow = filteredEntries.slice(start, end);

    // Desktop table rows
    rowsToShow.forEach(fields => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fields[0] || 'N/A'}</td>
            <td>${fields[1] || 'N/A'}</td>
            <td>${formatEpochTime(parseInt(fields[2]))}</td>
            <!-- <td>${formatEpochTime(parseInt(fields[3]))}</td> -->
            <td>${formatEpochTime(parseInt(fields[4]))}</td>
            <td>${fields[5] || 'N/A'}</td>
            <td>${fields[6] || 'N/A'}</td>
            <td>${fields[7] || 'N/A'}</td>
            <td>${fields[8] || 'N/A'}</td>
            <td>${fields[9] || 'N/A'}</td>
            <td>${fields[10] || 'N/A'}</td>
        `;
        tableBody.appendChild(row);
    });

    // Mobile license cards
    rowsToShow.forEach(fields => {
        const card = document.createElement('div');
        card.className = 'mobile-license-card';
        card.setAttribute('data-key', fields[0] || 'N/A');
        card.innerHTML = `
            <div class="mobile-license-header">
                <span class="mobile-license-key">${fields[0] || 'N/A'}</span>
            </div>
            <div class="mobile-license-field">
                <span class="mobile-license-field-label">Expiry Time:</span>
                <span class="mobile-license-field-value">${formatEpochTime(parseInt(fields[2]))}</span>
            </div>
            <button class="btn-toggle" onclick="toggleDetails('${fields[0] || 'N/A'}')">Show Details</button>
            <div class="mobile-license-details" id="details-${fields[0] || 'N/A'}">
                <div class="mobile-license-field">
                    <span class="mobile-license-field-label">Ban Status:</span>
                    <span class="mobile-license-field-value">${fields[1] || 'N/A'}</span>
                </div>
                <div class="mobile-license-field">
                    <span class="mobile-license-field-label">Generated Time:</span>
                    <span class="mobile-license-field-value">${formatEpochTime(parseInt(fields[3]))}</span>
                </div>
                <div class="mobile-license-field">
                    <span class="mobile-license-field-label">Last Login:</span>
                    <span class="mobile-license-field-value">${formatEpochTime(parseInt(fields[4]))}</span>
                </div>
                <div class="mobile-license-field">
                    <span class="mobile-license-field-label">Android ID:</span>
                    <span class="mobile-license-field-value">${fields[5] || 'N/A'}</span>
                </div>
                <div class="mobile-license-field">
                    <span class="mobile-license-field-label">Brand:</span>
                    <span class="mobile-license-field-value">${fields[6] || 'N/A'}</span>
                </div>
                <div class="mobile-license-field">
                    <span class="mobile-license-field-label">Model:</span>
                    <span class="mobile-license-field-value">${fields[7] || 'N/A'}</span>
                </div>
                <div class="mobile-license-field">
                    <span class="mobile-license-field-label">SDK:</span>
                    <span class="mobile-license-field-value">${fields[8] || 'N/A'}</span>
                </div>
                <div class="mobile-license-field">
                    <span class="mobile-license-field-label">IP:</span>
                    <span class="mobile-license-field-value">${fields[9] || 'N/A'}</span>
                </div>
                <div class="mobile-license-field">
                    <span class="mobile-license-field-label">Generated By:</span>
                    <span class="mobile-license-field-value">${fields[10] || 'N/A'}</span>
                </div>
            </div>
        `;
        mobileLicenseList.appendChild(card);
    });

    // Handle empty state
    if (filteredEntries.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" class="text-center">No licenses found.</td></tr>';
        mobileLicenseList.innerHTML = '<div class="text-center text-sm text-gray-500">No licenses found.</div>';
    }

    renderPagination(totalPages);
}

function toggleDetails(key) {
    const details = document.getElementById(`details-${key}`);
    const isActive = details.classList.contains('active');
    document.querySelectorAll('.mobile-license-details.active').forEach(panel => {
        panel.classList.remove('active');
    });
    if (!isActive) {
        details.classList.add('active');
    }
}

function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    const prevLi = document.createElement('li');
    prevLi.className = 'page-item' + (currentPage === 1 ? ' disabled' : '');
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>`;
    pagination.appendChild(prevLi);

    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
        const firstLi = document.createElement('li');
        firstLi.className = 'page-item';
        firstLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(1)">1</a>`;
        pagination.appendChild(firstLi);
        if (startPage > 2) {
            const dotsLi = document.createElement('li');
            dotsLi.className = 'page-item disabled';
            dotsLi.innerHTML = `<span class="page-link">...</span>`;
            pagination.appendChild(dotsLi);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = 'page-item' + (i === currentPage ? ' active' : '');
        pageLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
        pagination.appendChild(pageLi);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dotsLi = document.createElement('li');
            dotsLi.className = 'page-item disabled';
            dotsLi.innerHTML = `<span class="page-link">...</span>`;
            pagination.appendChild(dotsLi);
        }
        const lastLi = document.createElement('li');
        lastLi.className = 'page-item';
        lastLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a>`;
        pagination.appendChild(lastLi);
    }

    const nextLi = document.createElement('li');
    nextLi.className = 'page-item' + (currentPage === totalPages ? ' disabled' : '');
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>`;
    pagination.appendChild(nextLi);
}

function changePage(page) {
    currentPage = page;
    renderTable(currentPage);
}

function calculateTopSellers(entries) {
    const currentTimeIST = Math.floor(Date.now() / 1000) + 19800; // Current time in IST epoch seconds
    const thirtyDaysAgoIST = currentTimeIST - (30 * 24 * 3600); // 30 days ago in IST
    const thirtyDaysAgoUTC = thirtyDaysAgoIST - 19800; // Convert to UTC
    console.log('30 days ago UTC:', thirtyDaysAgoUTC, 'Formatted:', formatEpochTime(thirtyDaysAgoUTC));

    const generatedByCounts = new Map();
    entries.forEach(entry => {
        if (!entry || entry.length < 11) return;
        const generatedTime = parseInt(entry[3]);
        if (isNaN(generatedTime)) return;
        if (entry[10] && generatedTime >= thirtyDaysAgoUTC) {
            generatedByCounts.set(entry[10], (generatedByCounts.get(entry[10]) || 0) + 1);
        }
    });

    const sortedSellers = Array.from(generatedByCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([seller, count], index) => ({ seller, count, rank: index + 1 }));

    console.log('Top Sellers (30 days):', sortedSellers);
    return sortedSellers;
}

async function fetchLicenseData() {
    const url = 'https://xapilethalxvision.global.ssl.fastly.net/';
    const headers = {
        'Auth-Token': 'DDJgwS2wUIoKnIn9qkc0yqMarrhf59XaaZe79I0A5NC49QBLqlN7aD5PnvqvtCAQ',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        'X-BrowserData': 'GetKey;1;30000',
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: '{}'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
        }

        const textData = await response.text();
        console.log('API Response size:', textData.length, 'characters');

        const entries = textData.trim().split('\n').filter(line => line.trim() !== '');
        if (entries.length === 0) {
            throw new Error('Empty response from API');
        }

        const currentTimeIST = Math.floor(Date.now() / 1000) + 19800; // Current time in IST epoch seconds
        const twelveHoursAgoIST = currentTimeIST - (12 * 3600); // 12 hours ago in IST
        const sixtySecondsAgoIST = currentTimeIST - 60; // 60 seconds ago in IST
        const twelveHoursAgoUTC = twelveHoursAgoIST - 19800; // Convert to UTC
        const sixtySecondsAgoUTC = sixtySecondsAgoIST - 19800; // Convert to UTC

        console.log('Current IST:', formatEpochTime(currentTimeIST - 19800));
        console.log('12 hours ago UTC:', twelveHoursAgoUTC, '60 seconds ago UTC:', sixtySecondsAgoUTC);

        let activeUsers = 0;
        let onlineUsers = 0;

        allEntries = entries.map(entry => {
            const fields = entry.split(';');
            if (fields.length < 11) {
                console.warn('Invalid entry format, too few fields:', entry);
                return null;
            }
            const lastLoginTime = parseInt(fields[4]);
            console.log('LastLoginTime:', lastLoginTime, 'Formatted:', formatEpochTime(lastLoginTime));
            if (isNaN(lastLoginTime)) {
                console.warn('Invalid LastLoginTime in entry:', entry);
                return null;
            }
            if (lastLoginTime >= twelveHoursAgoUTC && lastLoginTime <= currentTimeIST - 19800) {
                activeUsers++;
            }
            if (lastLoginTime >= sixtySecondsAgoUTC && lastLoginTime <= currentTimeIST - 19800) {
                onlineUsers++;
            }
            return fields;
        }).filter(entry => entry !== null);

        console.log('Parsed entries:', allEntries.length, 'Active Users:', activeUsers, 'Online Users:', onlineUsers);

        // Calculate Top Sellers only on first load
        if (topSellers.length === 0) {
            topSellers = calculateTopSellers(allEntries);
        }

        document.getElementById('activeUsers').textContent = activeUsers;
        document.getElementById('onlineUsers').textContent = onlineUsers;
        document.getElementById('errorAlert').style.display = 'none';

        // Populate Generated By dropdown
        const generatedByFilter = document.getElementById('generatedByFilter');
        const currentFilter = generatedByFilter.value;
        generatedByFilter.innerHTML = '<option value="">All Generated By</option>';
        const generatedBySet = new Set(allEntries.map(entry => entry[10]).filter(Boolean));
        Array.from(generatedBySet).sort().forEach(user => {
            const option = document.createElement('option');
            option.value = user;
            option.textContent = user;
            if (user === currentFilter) option.selected = true;
            generatedByFilter.appendChild(option);
        });

        // Populate Top Sellers dropdown (using cached topSellers)
        const topSellersMenu = document.getElementById('topSellersMenu');
        topSellersMenu.innerHTML = '';
        if (topSellers.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = '<a class="dropdown-item" href="#">No sellers in last 30 days</a>';
            topSellersMenu.appendChild(li);
        } else {
            topSellers.forEach(({ seller, count, rank }) => {
                const li = document.createElement('li');
                li.innerHTML = `<a class="dropdown-item" href="#"><span class="rank">#${rank}</span> ${seller} (${count} licenses)</a>`;
                topSellersMenu.appendChild(li);
            });
        }

        renderTable(currentPage);
    } catch (error) {
        console.error('Error fetching data:', error);
        showError(`Error: ${error.message}`);
    }
}

const debouncedRenderTable = debounce(() => renderTable(currentPage), 300);
document.getElementById('searchInput').addEventListener('input', debouncedRenderTable);
document.getElementById('generatedByFilter').addEventListener('change', () => renderTable(1));

fetchLicenseData();
setInterval(fetchLicenseData, 5000);
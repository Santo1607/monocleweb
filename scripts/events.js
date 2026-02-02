// Event Data State
let selectedEvents = new Set();
const eventPrices = {
    'photo_meme': 50,
    'photo_pause': 50,
    'photo_dual': 50,
    'photo_mag': 50,
    'photo_color': 50,
    'video_add': 50,
    'video_trailer': 50,
    'video_scene': 50,
    'workshop_main': 99
};

const eventCategories = {
    'photo_meme': 'photography',
    'photo_pause': 'photography',
    'photo_dual': 'photography',
    'photo_mag': 'photography',
    'photo_color': 'photography',
    'video_add': 'videography',
    'video_trailer': 'videography',
    'video_scene': 'videography',
    'workshop_main': 'workshop'
};

function toggleSelection(btn, id, price, category) {
    const card = btn.closest('.event-card');

    if (selectedEvents.has(id)) {
        selectedEvents.delete(id);
        card.classList.remove('selected');
        btn.textContent = 'SELECT';
    } else {
        selectedEvents.add(id);
        card.classList.add('selected');
        btn.textContent = 'SELECTED';
    }

    updateFormUI();
}

function updateFormUI() {
    // Scroll to form if it's the first selection? No, might be annoying.
    // Just update the totals and hidden inputs

    let total = 0;

    // items by category
    const photos = [];
    const videos = [];
    const workshops = []; // Should be max 1 usually, but let's handle multiples if allowed

    selectedEvents.forEach(id => {
        const cat = eventCategories[id];
        if (cat === 'photography') photos.push(id);
        if (cat === 'videography') videos.push(id);
        if (cat === 'workshop') workshops.push(id);
    });

    // Greedy Match Logic
    // Priorities: 
    // 1. All 3 (Photo + Video + Workshop) -> 150
    // 2. Workshop + Photo -> 120
    // 3. Workshop + Video -> 120
    // 4. Photo + Video -> 85
    // Remainder -> specific price

    // While we have enough items for the biggest combo...
    while (photos.length > 0 && videos.length > 0 && workshops.length > 0) {
        total += 150;
        photos.pop();
        videos.pop();
        workshops.pop();
    }

    // 2-item combos involving workshop
    while (workshops.length > 0 && photos.length > 0) {
        total += 120;
        workshops.pop();
        photos.pop();
    }

    while (workshops.length > 0 && videos.length > 0) {
        total += 120;
        workshops.pop();
        videos.pop();
    }

    // Photo + Video combo
    while (photos.length > 0 && videos.length > 0) {
        total += 85;
        photos.pop();
        videos.pop();
    }

    // Add remainders
    total += photos.length * 50;
    total += videos.length * 50;
    total += workshops.length * 99;

    // Update Display
    const totalDisplay = document.getElementById('totalDisplay');
    const payBtn = document.getElementById('payBtn');

    totalDisplay.textContent = '₹' + total;

    // Update hidden inputs
    document.getElementById('finalAmount').value = total;

    if (total > 0) {
        payBtn.textContent = `PAY ₹${total} & REGISTER`;
        payBtn.disabled = false;
        payBtn.style.opacity = '1';
    } else {
        payBtn.textContent = 'SELECT EVENTS & ENTER DETAILS';
        payBtn.disabled = true;
        payBtn.style.opacity = '0.5';
    }

    // Update Checkbox list in form (or just text summary)
    updateSelectionList();
}

function updateSelectionList() {
    // Clean list for mobile
    const container = document.querySelector('.selection-group');
    container.innerHTML = '';

    if (selectedEvents.size === 0) {
        container.innerHTML = '<p style="color:#aaa; text-align:center;">No events selected above.</p>';
        return;
    }

    container.innerHTML = '<p style="color:#fff; margin-bottom:10px; border-bottom:1px solid #333; padding-bottom:5px;">Selected:</p>';

    // Simple vertical list
    selectedEvents.forEach(id => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.padding = '8px 0';
        div.style.color = '#ccc';
        div.style.borderBottom = '1px solid #222';

        div.innerHTML = `<span>${formatId(id)}</span> <span>₹${eventPrices[id]}</span>`;
        container.appendChild(div);
    });
}

function formatId(id) {
    return id.replace(/_/g, ' ').toUpperCase();
}

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwThySeO7c8_jGN6rJPKjF1QmwKrRZvyAZynpNF71aI5Rv460v7Q-ZArXmN_XIi89Mw/exec';

document.getElementById('registrationForm').addEventListener('submit', (e) => {
    e.preventDefault();

    if (selectedEvents.size === 0) {
        alert('Please select at least one event.');
        return;
    }

    const total = document.getElementById('totalDisplay').textContent.replace('₹', '');
    const payBtn = document.getElementById('payBtn');

    // Disable button to prevent double submit
    const originalBtnText = payBtn.textContent;
    payBtn.textContent = 'SAVING DATA...';
    payBtn.disabled = true;

    // Collect Data
    const formData = {
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        college: document.getElementById('regCollege').value,
        regNo: document.getElementById('regRegNo').value,
        events: Array.from(selectedEvents).join(', '),
        amount: total,
        paymentId: "Initiated_UPI"
    };

    // Send to Google Sheets
    // mode: 'no-cors' is important for simple opaque requests if we don't need the response content immediately,
    // but standard POST usually works. We'll use no-cors to be safe against CORS errors on simple hosting.
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(() => {
            // Success (or at least sent)
            payBtn.textContent = 'REDIRECTING TO PAYMENT...';

            // PROCEED TO PAYMENT
            initiatePayment(total);

            // Reset button after delay (if they come back)
            setTimeout(() => {
                payBtn.textContent = originalBtnText;
                payBtn.disabled = false;
            }, 3000);
        })
        .catch(err => {
            console.error('Error saving:', err);
            alert('Warning: Could not save details to server. Proceeding to payment anyway.');
            initiatePayment(total);
            payBtn.textContent = originalBtnText;
            payBtn.disabled = false;
        });
});

function initiatePayment(total) {
    // IMPORTANT: REPLACE THIS WITH YOUR ACTUAL MERCHANT/PERSONAL UPI ID
    const upiId = 'REPLACE_THIS_WITH_YOUR_UPI_ID@upi';
    const payeeName = 'CamOGenics Festival';
    const note = 'Monocle Reg';

    if (upiId.includes('REPLACE')) {
        alert('DEVELOPER NOTICE: Please open scripts/events.js and replace "REPLACE_THIS_WITH_YOUR_UPI_ID@upi" with your actual UPI ID (e.g., mobile@upi) for the payment to work.');
        return;
    }

    // UPI URL Scheme
    const upiLink = `upi://pay?pa=${upiId}&pn=${payeeName}&tn=${note}&am=${total}&cu=INR`;

    window.location.href = upiLink;
}

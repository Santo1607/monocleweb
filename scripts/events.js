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
    // Generate a summary text to put in a hidden input or show the user
    // We will dynamically create the checkbox list in the form based on what's clicked above for clarity
    const container = document.querySelector('.selection-group');
    container.innerHTML = ''; // Clear current

    if (selectedEvents.size === 0) {
        container.innerHTML = '<p style="color:#666; font-style:italic;">No events selected. Select events from the cards above to see the breakdown.</p>';
        return;
    }

    // Just list them simply
    selectedEvents.forEach(id => {
        const div = document.createElement('div');
        div.className = 'checkbox-card selected';
        div.style.padding = '10px';
        div.style.marginBottom = '5px';
        // Show original price
        div.innerHTML = `<span>${formatId(id)}</span> <span>₹${eventPrices[id]}</span>`;
        container.appendChild(div);
    });
}

function formatId(id) {
    return id.replace(/_/g, ' ').toUpperCase();
}

document.getElementById('registrationForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (selectedEvents.size === 0) {
        alert('Please select at least one event.');
        return;
    }

    const total = document.getElementById('totalDisplay').textContent.replace('₹', '');

    // MOBILE PAYMENT INTEGRATION
    // Since this is a phone-based site, we can try to open a UPI intent.
    // Replace 'your-upi-id@bank' with the actual UPI ID.
    const upiId = 'camogenics@srm'; // Placeholder
    const payeeName = 'CamOGenics';
    const note = 'Monocle Registration';

    // UPI URL Scheme
    const upiLink = `upi://pay?pa=${upiId}&pn=${payeeName}&tn=${note}&am=${total}&cu=INR`;

    // Save data before redirecting (mock save)
    console.log('Saving registration...');

    // Redirect to Payment
    // On mobile, this will open GPay/PhonePe/Paytm if installed.
    // On desktop, it might do nothing or open a handling app.

    if (confirm(`Redirecting to payment gateway for ₹${total}. Proceed?`)) {
        window.location.href = upiLink;
    }
});

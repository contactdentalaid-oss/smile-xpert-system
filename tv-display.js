// tv-display.js - TV Display Screen functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
    
    // Start clock
    DateTime.startClock('digital-clock', 'current-date');
    
    // Load initial data
    loadDisplayData();
    
    // Initialize image slider
    const images = DataManager.getSliderImages();
    ImageSlider.init('slider-container', images);
    
    // Initialize marquee
    const marqueeContent = DataManager.getMarqueeContent();
    MarqueeManager.init('marquee-content', marqueeContent);
    
    // Set up Broadcast Channel listener
    if (broadcastChannel) {
        broadcastChannel.onmessage = function(event) {
            if (event.data.type === 'data-updated') {
                loadDisplayData();
                
                // Update marquee
                const marqueeContent = DataManager.getMarqueeContent();
                MarqueeManager.init('marquee-content', marqueeContent);
                
                // Update slider
                const images = DataManager.getSliderImages();
                ImageSlider.init('slider-container', images);
                
                UIHelper.showAlert('ডেটা আপডেট হয়েছে', 'success');
            }
            
            if (event.data.type === 'call-next-patient') {
                callNextPatient();
            }
        };
    }
    
    // Set up announcement modal close button
    const closeAnnouncementBtn = document.getElementById('close-announcement');
    if (closeAnnouncementBtn) {
        closeAnnouncementBtn.addEventListener('click', function() {
            UIHelper.hideModal('announcement-modal');
        });
    }
    
    // Refresh data every 30 seconds (fallback)
    setInterval(loadDisplayData, 30000);
});

// Load and display data
function loadDisplayData() {
    // Load active treatments
    const treatments = DataManager.getActiveTreatments();
    const tbody = document.getElementById('active-treatment-body');
    const activeCountElement = document.getElementById('active-count');
    
    if (!tbody || !activeCountElement) return;
    
    if (treatments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-user-md text-4xl text-gray-300 mb-4"></i>
                    <p class="text-lg">কোনও সক্রিয় চিকিত্সা পাওয়া যায়নি</p>
                    <p class="text-sm mt-2">অ্যাডমিন প্যানেল থেকে রোগীর তথ্য যোগ করুন</p>
                </td>
            </tr>
        `;
        activeCountElement.textContent = '0';
    } else {
        let html = '';
        treatments.forEach((treatment, index) => {
            const statusClass = treatment.status === 'In-Progress' ? 'status-in-progress' : 'status-next';
            const statusText = treatment.status === 'In-Progress' ? 'চলমান' : 'পরবর্তী';
            
            html += `
                <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition duration-200">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bengali-text">${UIHelper.formatPatientName(treatment.surgeon)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${treatment.unit || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 bengali-text">${UIHelper.formatPatientName(treatment.patient)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="${statusClass}">${statusText}</span>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        activeCountElement.textContent = treatments.length;
    }
    
    // Load waiting list
    const waitingList = DataManager.getWaitingList();
    const waitingContainer = document.getElementById('waiting-list');
    const waitingCountElement = document.getElementById('waiting-count');
    
    if (!waitingContainer || !waitingCountElement) return;
    
    if (waitingList.length === 0) {
        waitingContainer.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-users text-4xl text-gray-300 mb-4"></i>
                <p class="text-lg">অপেক্ষমান তালিকা খালি</p>
                <p class="text-sm mt-2">অ্যাডমিন প্যানেল থেকে রোগী যোগ করুন</p>
            </div>
        `;
        waitingCountElement.textContent = '0';
    } else {
        let html = '';
        waitingList.forEach((patient, index) => {
            html += `
                <div class="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-blue-50 transition duration-200">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-teal-100 flex items-center justify-center mr-4">
                        <span class="font-bold text-blue-700">${index + 1}</span>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800 bengali-text">${UIHelper.formatPatientName(patient.name)}</h4>
                        <p class="text-sm text-gray-600">প্রক্রিয়া: ${patient.procedure || 'সাধান্ত চেকআপ'}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-500">অপেক্ষার সময়</div>
                        <div class="font-semibold text-gray-700">${patient.waitTime || '১৫ মিনিট'}</div>
                    </div>
                </div>
            `;
        });
        
        waitingContainer.innerHTML = html;
        waitingCountElement.textContent = waitingList.length;
    }
}

// Call next patient
function callNextPatient() {
    const waitingList = DataManager.getWaitingList();
    
    if (waitingList.length === 0) {
        UIHelper.showAlert('অপেক্ষমান তালিকা খালি', 'warning');
        return;
    }
    
    const nextPatient = waitingList[0];
    
    // Show announcement modal
    const announcedPatientElement = document.getElementById('announced-patient');
    if (announcedPatientElement) {
        announcedPatientElement.textContent = UIHelper.formatPatientName(nextPatient.name);
    }
    
    UIHelper.showModal('announcement-modal');
    
    // Announce patient name
    SpeechManager.announceNextPatient(nextPatient.name);
    
    // Move patient from waiting list to active treatments as "Next"
    const newTreatment = {
        surgeon: "ডা. আহমেদ করিম",
        unit: "OT-2",
        patient: nextPatient.name,
        status: "Next"
    };
    
    // Add to active treatments
    DataManager.addActiveTreatment(newTreatment);
    
    // Remove from waiting list
    DataManager.deleteWaitingPatient(0);
    
    // Update display after announcement
    setTimeout(() => {
        loadDisplayData();
        UIHelper.hideModal('announcement-modal');
        UIHelper.showAlert(`${nextPatient.name} ডাকা হয়েছে`, 'success');
    }, 5000);
}

// Function to be called when data is updated (for fallback)
window.onDataUpdated = loadDisplayData;
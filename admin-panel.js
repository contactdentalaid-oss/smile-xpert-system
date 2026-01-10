// admin-panel.js - Admin Control Panel functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
    
    // Start admin clock
    DateTime.startClock('admin-clock');
    
    // Load initial data
    loadAdminData();
    
    // Initialize tabs
    TabManager.init('.tab-button', '.tab-content');
    
    // Set up Broadcast Channel listener
    if (broadcastChannel) {
        broadcastChannel.onmessage = function(event) {
            if (event.data.type === 'data-updated') {
                loadAdminData();
                UIHelper.showAlert('ডেটা সিঙ্ক্রোনাইজড হয়েছে', 'success');
            }
        };
    }
    
    // Treatment form functionality
    const addTreatmentBtn = document.getElementById('add-treatment-btn');
    const cancelTreatmentBtn = document.getElementById('cancel-treatment-btn');
    const saveTreatmentBtn = document.getElementById('save-treatment-btn');
    
    if (addTreatmentBtn) {
        addTreatmentBtn.addEventListener('click', function() {
            document.getElementById('treatment-form-container').style.display = 'block';
            addTreatmentBtn.style.display = 'none';
        });
    }
    
    if (cancelTreatmentBtn) {
        cancelTreatmentBtn.addEventListener('click', function() {
            document.getElementById('treatment-form-container').style.display = 'none';
            addTreatmentBtn.style.display = 'flex';
            
            // Clear form
            document.getElementById('surgeon-input').value = '';
            document.getElementById('unit-input').value = '';
            document.getElementById('patient-input').value = '';
            document.getElementById('status-input').value = 'In-Progress';
        });
    }
    
    if (saveTreatmentBtn) {
        saveTreatmentBtn.addEventListener('click', saveTreatment);
    }
    
    // Waiting list form functionality
    const addWaitingBtn = document.getElementById('add-waiting-btn');
    const cancelWaitingBtn = document.getElementById('cancel-waiting-btn');
    const saveWaitingBtn = document.getElementById('save-waiting-btn');
    
    if (addWaitingBtn) {
        addWaitingBtn.addEventListener('click', function() {
            document.getElementById('waiting-form-container').style.display = 'block';
            addWaitingBtn.style.display = 'none';
        });
    }
    
    if (cancelWaitingBtn) {
        cancelWaitingBtn.addEventListener('click', function() {
            document.getElementById('waiting-form-container').style.display = 'none';
            addWaitingBtn.style.display = 'flex';
            
            // Clear form
            document.getElementById('waiting-name-input').value = '';
            document.getElementById('waiting-procedure-input').value = '';
            document.getElementById('waiting-time-input').value = '';
        });
    }
    
    if (saveWaitingBtn) {
        saveWaitingBtn.addEventListener('click', saveWaitingPatient);
    }
    
    // Marquee functionality
    const saveMarqueeBtn = document.getElementById('save-marquee-btn');
    const marqueeText = document.getElementById('marquee-text');
    
    if (saveMarqueeBtn) {
        saveMarqueeBtn.addEventListener('click', saveMarquee);
    }
    
    if (marqueeText) {
        marqueeText.addEventListener('input', function() {
            const preview = document.getElementById('marquee-preview');
            if (preview) {
                preview.textContent = this.value || 'বার্তা প্রিভিউ এখানে দেখানো হবে...';
            }
        });
    }
    
    // Image slider functionality
    const addImageBtn = document.getElementById('add-image-btn');
    
    if (addImageBtn) {
        addImageBtn.addEventListener('click', addSliderImage);
    }
    
    // Call next patient
    const callNextBtn = document.getElementById('call-next-btn');
    
    if (callNextBtn) {
        callNextBtn.addEventListener('click', callNextPatientFromAdmin);
    }
    
    // Refresh data every 30 seconds
    setInterval(loadAdminData, 30000);
});

// Load admin data
function loadAdminData() {
    // Load active treatments
    const treatments = DataManager.getActiveTreatments();
    const tbody = document.getElementById('treatment-table-body');
    const statusActiveCount = document.getElementById('status-active-count');
    
    if (tbody) {
        if (treatments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                        <i class="fas fa-user-md text-4xl text-gray-300 mb-4"></i>
                        <p class="text-lg">কোনও সক্রিয় চিকিত্সা পাওয়া যায়নি</p>
                        <p class="text-sm mt-2">নতুন চিকিত্সা যোগ করুন</p>
                    </td>
                </tr>
            `;
        } else {
            let html = '';
            treatments.forEach((treatment, index) => {
                const statusText = treatment.status === 'In-Progress' ? 'চলমান' : 'পরবর্তী';
                const statusClass = treatment.status === 'In-Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
                
                html += `
                    <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bengali-text">${UIHelper.formatPatientName(treatment.surgeon)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${treatment.unit || 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 bengali-text">${UIHelper.formatPatientName(treatment.patient)}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="${statusClass} px-3 py-1 rounded-full text-sm font-semibold">${statusText}</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onclick="deleteTreatment(${index})" class="text-red-600 hover:text-red-900 mr-4">
                                <i class="fas fa-trash mr-1"></i> মুছুন
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
        }
    }
    
    if (statusActiveCount) {
        statusActiveCount.textContent = treatments.length;
    }
    
    // Load waiting list
    const waitingList = DataManager.getWaitingList();
    const waitingContainer = document.getElementById('waiting-table');
    const statusWaitingCount = document.getElementById('status-waiting-count');
    
    if (waitingContainer) {
        if (waitingList.length === 0) {
            waitingContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-users text-4xl text-gray-300 mb-4"></i>
                    <p class="text-lg">অপেক্ষমান তালিকা খালি</p>
                    <p class="text-sm mt-2">নতুন রোগী যোগ করুন</p>
                </div>
            `;
        } else {
            let html = '';
            waitingList.forEach((patient, index) => {
                html += `
                    <div class="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
                        <div class="flex items-center">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-teal-100 flex items-center justify-center mr-4">
                                <span class="font-bold text-blue-700">${index + 1}</span>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-800 bengali-text">${UIHelper.formatPatientName(patient.name)}</h4>
                                <p class="text-sm text-gray-600">প্রক্রিয়া: ${patient.procedure || 'সাধান্ত চেকআপ'}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-500">অপেক্ষার সময়</div>
                            <div class="font-semibold text-gray-700 mb-2">${patient.waitTime || '১৫ মিনিট'}</div>
                            <button onclick="deleteWaitingPatient(${index})" class="text-sm text-red-600 hover:text-red-900">
                                <i class="fas fa-trash mr-1"></i> মুছুন
                            </button>
                        </div>
                    </div>
                `;
            });
            
            waitingContainer.innerHTML = html;
        }
    }
    
    if (statusWaitingCount) {
        statusWaitingCount.textContent = waitingList.length;
    }
    
    // Load marquee content
    const marqueeContent = DataManager.getMarqueeContent();
    const marqueeText = document.getElementById('marquee-text');
    const marqueePreview = document.getElementById('marquee-preview');
    
    if (marqueeText) {
        marqueeText.value = marqueeContent;
    }
    
    if (marqueePreview) {
        marqueePreview.textContent = marqueeContent;
    }
    
    // Load slider images
    loadAdminSliderImages();
}

// Save treatment
function saveTreatment() {
    const surgeon = document.getElementById('surgeon-input').value.trim();
    const unit = document.getElementById('unit-input').value.trim();
    const patient = document.getElementById('patient-input').value.trim();
    const status = document.getElementById('status-input').value;
    
    if (!surgeon || !unit || !patient) {
        UIHelper.showAlert('দয়া করে সমস্ত ফিল্ড পূর্ণ করুন।', 'warning');
        return;
    }
    
    DataManager.addActiveTreatment({
        surgeon,
        unit,
        patient,
        status
    });
    
    // Hide form and show button
    document.getElementById('treatment-form-container').style.display = 'none';
    document.getElementById('add-treatment-btn').style.display = 'flex';
    
    // Clear form
    document.getElementById('surgeon-input').value = '';
    document.getElementById('unit-input').value = '';
    document.getElementById('patient-input').value = '';
    document.getElementById('status-input').value = 'In-Progress';
    
    // Reload data
    loadAdminData();
    
    UIHelper.showAlert('চিকিত্সা তথ্য সংরক্ষিত হয়েছে', 'success');
}

// Delete treatment
function deleteTreatment(index) {
    if (confirm('আপনি কি এই চিকিত্সা মুছে ফেলতে চান?')) {
        DataManager.deleteActiveTreatment(index);
        loadAdminData();
        UIHelper.showAlert('চিকিত্সা মুছে ফেলা হয়েছে', 'success');
    }
}

// Save waiting patient
function saveWaitingPatient() {
    const name = document.getElementById('waiting-name-input').value.trim();
    const procedure = document.getElementById('waiting-procedure-input').value.trim();
    const waitTime = document.getElementById('waiting-time-input').value.trim();
    
    if (!name) {
        UIHelper.showAlert('দয়া করে রোগীর নাম লিখুন।', 'warning');
        return;
    }
    
    DataManager.addWaitingPatient({
        name,
        procedure: procedure || 'সাধান্ত চেকআপ',
        waitTime: waitTime || '১৫ মিনিট'
    });
    
    // Hide form and show button
    document.getElementById('waiting-form-container').style.display = 'none';
    document.getElementById('add-waiting-btn').style.display = 'flex';
    
    // Clear form
    document.getElementById('waiting-name-input').value = '';
    document.getElementById('waiting-procedure-input').value = '';
    document.getElementById('waiting-time-input').value = '';
    
    // Reload data
    loadAdminData();
    
    UIHelper.showAlert('রোগীর তথ্য সংরক্ষিত হয়েছে', 'success');
}

// Delete waiting patient
function deleteWaitingPatient(index) {
    if (confirm('আপনি কি এই রোগীকে অপেক্ষমান তালিকা থেকে মুছে ফেলতে চান?')) {
        DataManager.deleteWaitingPatient(index);
        loadAdminData();
        UIHelper.showAlert('রোগী মুছে ফেলা হয়েছে', 'success');
    }
}

// Save marquee
function saveMarquee() {
    const marqueeText = document.getElementById('marquee-text').value.trim();
    
    if (!marqueeText) {
        UIHelper.showAlert('দয়া করে নোটিস বোর্ডের বার্তা লিখুন।', 'warning');
        return;
    }
    
    DataManager.setMarqueeContent(marqueeText);
    UIHelper.showAlert('বার্তা সংরক্ষিত হয়েছে!', 'success');
}

// Load admin slider images
function loadAdminSliderImages() {
    const images = DataManager.getSliderImages();
    const container = document.getElementById('slider-images-container');
    const statusImageCount = document.getElementById('status-image-count');
    
    if (statusImageCount) {
        statusImageCount.textContent = images.length;
    }
    
    if (container) {
        if (images.length === 0) {
            container.innerHTML = `
                <div class="md:col-span-3 text-center py-8 text-gray-500">
                    <i class="fas fa-images text-4xl text-gray-300 mb-4"></i>
                    <p class="text-lg">কোনও স্লাইডার ইমেজ পাওয়া যায়নি</p>
                    <p class="text-sm mt-2">উপরে ইমেজ URL যোগ করুন</p>
                </div>
            `;
        } else {
            let html = '';
            images.forEach((image, index) => {
                html += `
                    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div class="h-48 overflow-hidden">
                            <img src="${image}" alt="Slider Image ${index + 1}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/400x300?text=Image+Error'">
                        </div>
                        <div class="p-4">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">ইমেজ #${index + 1}</span>
                                <button onclick="deleteSliderImage(${index})" class="text-red-600 hover:text-red-900 text-sm">
                                    <i class="fas fa-trash mr-1"></i> মুছুন
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        }
    }
}

// Add slider image
function addSliderImage() {
    const imageUrl = document.getElementById('image-url-input').value.trim();
    
    if (!imageUrl) {
        UIHelper.showAlert('দয়া করে ইমেজ URL লিখুন।', 'warning');
        return;
    }
    
    // Basic URL validation
    if (!imageUrl.startsWith('http')) {
        UIHelper.showAlert('দয়া করে একটি বৈধ URL লিখুন (http বা https দিয়ে শুরু হতে হবে)।', 'warning');
        return;
    }
    
    DataManager.addSliderImage(imageUrl);
    
    // Clear input
    document.getElementById('image-url-input').value = '';
    
    // Reload images
    loadAdminSliderImages();
    
    UIHelper.showAlert('ইমেজ যোগ করা হয়েছে', 'success');
}

// Delete slider image
function deleteSliderImage(index) {
    if (confirm('আপনি কি এই ইমেজ মুছে ফেলতে চান?')) {
        DataManager.deleteSliderImage(index);
        loadAdminSliderImages();
        UIHelper.showAlert('ইমেজ মুছে ফেলা হয়েছে', 'success');
    }
}

// Call next patient from admin
function callNextPatientFromAdmin() {
    const waitingList = DataManager.getWaitingList();
    
    if (waitingList.length === 0) {
        UIHelper.showAlert('অপেক্ষমান তালিকা খালি। প্রথমে অপেক্ষমান তালিকায় রোগী যোগ করুন।', 'warning');
        return;
    }
    
    if (confirm('আপনি কি পরবর্তী রোগী ডাকতে চান? এই রোগীর নাম TV স্ক্রিনে প্রদর্শিত হবে এবং বাংলায় ঘোষণা করা হবে।')) {
        // Notify TV display to call next patient
        notifyCallNextPatient();
        UIHelper.showAlert('রোগী ডাকা হয়েছে। TV স্ক্রিন চেক করুন।', 'success');
    }
}

// Make functions globally available
window.deleteTreatment = deleteTreatment;
window.deleteWaitingPatient = deleteWaitingPatient;
window.deleteSliderImage = deleteSliderImage;
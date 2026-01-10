// shared.js - Shared functionality for both pages

// Broadcast Channel for real-time synchronization
let broadcastChannel;

// Initialize Broadcast Channel
function initBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
        broadcastChannel = new BroadcastChannel('smile-xpert-channel');
        console.log('Broadcast Channel initialized');
    } else {
        console.warn('Broadcast Channel API not supported. Using localStorage polling instead.');
        startLocalStoragePolling();
    }
}

// Fallback for browsers without Broadcast Channel
function startLocalStoragePolling() {
    setInterval(() => {
        const lastUpdate = localStorage.getItem('lastUpdate');
        const currentUpdate = localStorage.getItem('currentUpdate');
        
        if (lastUpdate !== currentUpdate) {
            localStorage.setItem('lastUpdate', currentUpdate);
            if (typeof onDataUpdated === 'function') {
                onDataUpdated();
            }
        }
    }, 1000);
}

// Send update notification through Broadcast Channel
function notifyDataUpdate() {
    if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'data-updated', timestamp: Date.now() });
    } else {
        // Fallback to localStorage
        localStorage.setItem('currentUpdate', Date.now().toString());
    }
}

// Send call next patient notification
function notifyCallNextPatient() {
    if (broadcastChannel) {
        broadcastChannel.postMessage({ 
            type: 'call-next-patient', 
            timestamp: Date.now() 
        });
    }
}

// Data Storage Functions
const DataManager = {
    // Active Treatments
    getActiveTreatments: () => {
        return JSON.parse(localStorage.getItem('activeTreatments') || '[]');
    },
    
    setActiveTreatments: (treatments) => {
        localStorage.setItem('activeTreatments', JSON.stringify(treatments));
        notifyDataUpdate();
    },
    
    addActiveTreatment: (treatment) => {
        const treatments = DataManager.getActiveTreatments();
        treatments.push(treatment);
        DataManager.setActiveTreatments(treatments);
        return treatments;
    },
    
    deleteActiveTreatment: (index) => {
        const treatments = DataManager.getActiveTreatments();
        treatments.splice(index, 1);
        DataManager.setActiveTreatments(treatments);
        return treatments;
    },
    
    updateTreatmentStatus: (index, status) => {
        const treatments = DataManager.getActiveTreatments();
        if (treatments[index]) {
            treatments[index].status = status;
            DataManager.setActiveTreatments(treatments);
        }
        return treatments;
    },
    
    // Waiting List
    getWaitingList: () => {
        return JSON.parse(localStorage.getItem('waitingList') || '[]');
    },
    
    setWaitingList: (list) => {
        localStorage.setItem('waitingList', JSON.stringify(list));
        notifyDataUpdate();
    },
    
    addWaitingPatient: (patient) => {
        const list = DataManager.getWaitingList();
        list.push(patient);
        DataManager.setWaitingList(list);
        return list;
    },
    
    deleteWaitingPatient: (index) => {
        const list = DataManager.getWaitingList();
        list.splice(index, 1);
        DataManager.setWaitingList(list);
        return list;
    },
    
    getNextPatient: () => {
        const list = DataManager.getWaitingList();
        return list.length > 0 ? list[0] : null;
    },
    
    // Marquee Content
    getMarqueeContent: () => {
        return localStorage.getItem('marqueeContent') || 'স্বাগতম Smile Xpert ডেন্টাল ক্লিনিকে। আমাদের বিশেষজ্ঞ দল আপনাকে সর্বোচ্চ মানের ডেন্টাল যত্ন প্রদান করবে।';
    },
    
    setMarqueeContent: (content) => {
        localStorage.setItem('marqueeContent', content);
        notifyDataUpdate();
    },
    
    // Slider Images
    getSliderImages: () => {
        return JSON.parse(localStorage.getItem('sliderImages') || '[]');
    },
    
    setSliderImages: (images) => {
        localStorage.setItem('sliderImages', JSON.stringify(images));
        notifyDataUpdate();
    },
    
    addSliderImage: (imageUrl) => {
        const images = DataManager.getSliderImages();
        images.push(imageUrl);
        DataManager.setSliderImages(images);
        return images;
    },
    
    deleteSliderImage: (index) => {
        const images = DataManager.getSliderImages();
        images.splice(index, 1);
        DataManager.setSliderImages(images);
        return images;
    },
    
    // Initialize default data if empty
    initDefaultData: () => {
        if (!localStorage.getItem('activeTreatments')) {
            const defaultTreatments = [
                {
                    surgeon: 'ডা. আহমেদ করিম',
                    unit: 'OT-1',
                    patient: 'মো. রহিমুল ইসলাম',
                    status: 'In-Progress'
                },
                {
                    surgeon: 'ডা. ফারহানা আক্তার',
                    unit: 'OT-2',
                    patient: 'সালমা খাতুন',
                    status: 'Next'
                }
            ];
            DataManager.setActiveTreatments(defaultTreatments);
        }
        
        if (!localStorage.getItem('waitingList')) {
            const defaultWaitingList = [
                {
                    name: 'মো. জাহিদ হাসান',
                    procedure: 'দাঁতের চিকিত্সা',
                    waitTime: '১৫ মিনিট'
                },
                {
                    name: 'আনিকা তাবাসসুম',
                    procedure: 'ডেন্টাল চেকআপ',
                    waitTime: '২০ মিনিট'
                },
                {
                    name: 'রফিকুল ইসলাম',
                    procedure: 'দাঁতের ব্যথা',
                    waitTime: '১০ মিনিট'
                }
            ];
            DataManager.setWaitingList(defaultWaitingList);
        }
        
        if (!localStorage.getItem('marqueeContent')) {
            DataManager.setMarqueeContent('স্বাগতম Smile Xpert ডেন্টাল ক্লিনিকে। আমাদের বিশেষজ্ঞ দল আপনাকে সর্বোচ্চ মানের ডেন্টাল যত্ন প্রদান করবে। আজকের বিশেষ অফার: দাঁতের সাদা করার জন্য ২০% ছাড়। আরও তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন।');
        }
        
        if (!localStorage.getItem('sliderImages')) {
            const defaultImages = [
                'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w-800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w-800&auto=format&fit=crop'
            ];
            DataManager.setSliderImages(defaultImages);
        }
    }
};

// Date and Time Utilities
const DateTime = {
    updateClock: (clockElementId, dateElementId) => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        
        const dateString = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        if (clockElementId) {
            const clockElement = document.getElementById(clockElementId);
            if (clockElement) {
                clockElement.textContent = timeString;
            }
        }
        
        if (dateElementId) {
            const dateElement = document.getElementById(dateElementId);
            if (dateElement) {
                dateElement.textContent = dateString;
            }
        }
    },
    
    startClock: (clockElementId, dateElementId) => {
        DateTime.updateClock(clockElementId, dateElementId);
        setInterval(() => {
            DateTime.updateClock(clockElementId, dateElementId);
        }, 1000);
    },
    
    formatTime: (minutes) => {
        if (minutes < 60) {
            return `${minutes} মিনিট`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours} ঘণ্টা ${remainingMinutes} মিনিট`;
        }
    }
};

// Web Speech API for Bengali Announcements
const SpeechManager = {
    isSupported: () => {
        return 'speechSynthesis' in window;
    },
    
    speak: (text, lang = 'bn-BD') => {
        if (!SpeechManager.isSupported()) {
            console.warn('Speech synthesis not supported');
            return false;
        }
        
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Try to find Bengali voice
        const voices = speechSynthesis.getVoices();
        const bengaliVoice = voices.find(voice => 
            voice.lang.startsWith('bn') || 
            voice.name.toLowerCase().includes('bengali')
        );
        
        if (bengaliVoice) {
            utterance.voice = bengaliVoice;
        }
        
        // Speak the text
        speechSynthesis.speak(utterance);
        
        return true;
    },
    
    announceNextPatient: (patientName) => {
        const announcement = `পরবর্তী রোগী, ${patientName}`;
        return SpeechManager.speak(announcement);
    }
};

// Image Slider Management
const ImageSlider = {
    currentIndex: 0,
    interval: null,
    
    init: (containerId, images) => {
        const container = document.getElementById(containerId);
        if (!container || !images || images.length === 0) return;
        
        // Clear existing content
        container.innerHTML = '';
        
        // Add images to container
        images.forEach((imageUrl, index) => {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = `Clinic Image ${index + 1}`;
            img.className = 'slider-image absolute top-0 left-0 w-full h-full object-cover';
            img.style.opacity = index === 0 ? '1' : '0';
            container.appendChild(img);
        });
        
        // Start auto-slide
        ImageSlider.startAutoSlide(containerId, images.length);
    },
    
    startAutoSlide: (containerId, totalImages) => {
        if (ImageSlider.interval) {
            clearInterval(ImageSlider.interval);
        }
        
        if (totalImages <= 1) return;
        
        ImageSlider.interval = setInterval(() => {
            ImageSlider.nextSlide(containerId, totalImages);
        }, 5000);
    },
    
    nextSlide: (containerId, totalImages) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const images = container.querySelectorAll('.slider-image');
        
        // Hide current image
        images[ImageSlider.currentIndex].style.opacity = '0';
        
        // Move to next image
        ImageSlider.currentIndex = (ImageSlider.currentIndex + 1) % totalImages;
        
        // Show next image
        images[ImageSlider.currentIndex].style.opacity = '1';
    },
    
    stopAutoSlide: () => {
        if (ImageSlider.interval) {
            clearInterval(ImageSlider.interval);
            ImageSlider.interval = null;
        }
    }
};

// Marquee Management
const MarqueeManager = {
    init: (contentElementId, content) => {
        const element = document.getElementById(contentElementId);
        if (!element) return;
        
        element.textContent = content;
        
        // Restart animation
        element.style.animation = 'none';
        setTimeout(() => {
            element.style.animation = '';
        }, 10);
    }
};

// UI Helper Functions
const UIHelper = {
    showAlert: (message, type = 'info', duration = 3000) => {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} fade-in`;
        alertDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(alertDiv);
        
        // Remove after duration
        setTimeout(() => {
            alertDiv.classList.add('hidden');
            setTimeout(() => {
                document.body.removeChild(alertDiv);
            }, 300);
        }, duration);
    },
    
    showModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    hideModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    },
    
    formatPatientName: (name) => {
        // Ensure Bengali text is properly displayed
        return name || 'নামহীন রোগী';
    },
    
    createLoadingSpinner: () => {
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        return spinner;
    }
};

// Tab Management
const TabManager = {
    init: (tabButtonsSelector, tabContentsSelector) => {
        const tabButtons = document.querySelectorAll(tabButtonsSelector);
        const tabContents = document.querySelectorAll(tabContentsSelector);
        
        if (tabButtons.length === 0 || tabContents.length === 0) return;
        
        // Show first tab by default
        if (tabButtons.length > 0 && tabContents.length > 0) {
            tabButtons[0].classList.add('active');
            tabContents[0].classList.remove('hidden');
        }
        
        // Add click handlers
        tabButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                // Update active button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show corresponding content
                tabContents.forEach(content => content.classList.add('hidden'));
                tabContents[index].classList.remove('hidden');
            });
        });
    }
};

// Initialize the application
function initApp() {
    // Initialize Broadcast Channel
    initBroadcastChannel();
    
    // Initialize default data
    DataManager.initDefaultData();
    
    // Load voices for speech synthesis
    if (SpeechManager.isSupported()) {
        // Chrome needs this to load voices properly
        speechSynthesis.getVoices();
        setTimeout(() => {
            speechSynthesis.getVoices();
        }, 100);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DataManager,
        DateTime,
        SpeechManager,
        ImageSlider,
        MarqueeManager,
        UIHelper,
        TabManager,
        initApp
    };
}
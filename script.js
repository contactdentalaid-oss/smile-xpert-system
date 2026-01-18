// TV Display Script - Smile Xpert System

// ডেটা স্টোরেজ ক্লাস
class DataStorage {
    constructor() {
        this.broadcastChannel = new BroadcastChannel('smile-xpert-channel');
        this.initStorage();
        this.setupBroadcastListener();
    }
    
    initStorage() {
        // ডিফল্ট ডেটা সেট করুন যদি না থাকে
        if (!localStorage.getItem('doctors')) {
            this.setDefaultData();
        }
    }
    
    setDefaultData() {
        const defaultDoctors = [
            { id: 1, name: "ডাঃ মোঃ রফিকুল ইসলাম", specialty: "অর্থোডন্টিস্ট", room: "১০১", status: "available" },
            { id: 2, name: "ডাঃ শারমিন আক্তার", specialty: "পিরিওডন্টিস্ট", room: "১০২", status: "available" },
            { id: 3, name: "ডাঃ আহমেদ জুবায়ের", specialty: "এন্ডোডন্টিস্ট", room: "১০৩", status: "busy" }
        ];
        
        const defaultTreatment = [
            { id: 1, patientName: "মোঃ সাজেদুল ইসলাম", patientId: "SX-2024-015", unit: "ইউনিট-০১", doctor: "ডাঃ মোঃ রফিকুল ইসলাম", startTime: "10:30 AM" },
            { id: 2, patientName: "ফারহানা ইয়াসমিন", patientId: "SX-2024-016", unit: "ইউনিট-০২", doctor: "ডাঃ শারমিন আক্তার", startTime: "10:45 AM" }
        ];
        
        const defaultWaiting = [
            { id: 1, token: 1, patientName: "মোঃ করিম উদ্দিন", doctor: "", priority: "normal", time: "11:00 AM" },
            { id: 2, token: 2, patientName: "রুবিনা আক্তার", doctor: "ডাঃ আহমেদ জুবায়ের", priority: "normal", time: "11:05 AM" },
            { id: 3, token: 3, patientName: "আব্দুল হালিম", doctor: "", priority: "priority", time: "11:10 AM" },
            { id: 4, token: 4, patientName: "নাসরিন সুলতানা", doctor: "ডাঃ শারমিন আক্তার", priority: "normal", time: "11:15 AM" },
            { id: 5, token: 5, patientName: "রফিক আহমেদ", doctor: "", priority: "normal", time: "11:20 AM" }
        ];
        
        const defaultImages = [
            { id: 1, url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "আধুনিক ডেন্টাল চেয়ার", description: "আমাদের ক্লিনিকে ব্যবহৃত সর্বাধুনিক ডেন্টাল চেয়ার", displayTime: 5 },
            { id: 2, url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "ডিজিটাল এক্স-রে মেশিন", description: "হাই-রেজোলিউশন ডিজিটাল এক্স-রে মেশিন", displayTime: 5 },
            { id: 3, url: "https://images.unsplash.com/photo-1556228578-9c360e1d8d34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "স্টেরিলাইজেশন ইউনিট", description: "আধুনিক স্টেরিলাইজেশন ব্যবস্থা", displayTime: 5 }
        ];
        
        const defaultNotices = [
            { id: 1, text: "আজকের বিশেষ অফার: টুথ হোয়াইটনিং ২০% ছাড়ে", type: "offer", added: "10:00 AM", expires: "6:00 PM" },
            { id: 2, text: "নতুন রোগীদের জন্য ফ্রি চেকআপ ক্যাম্পেইন চলছে", type: "info", added: "9:30 AM", expires: "5:00 PM" }
        ];
        
        localStorage.setItem('doctors', JSON.stringify(defaultDoctors));
        localStorage.setItem('currentTreatment', JSON.stringify(defaultTreatment));
        localStorage.setItem('waitingList', JSON.stringify(defaultWaiting));
        localStorage.setItem('images', JSON.stringify(defaultImages));
        localStorage.setItem('notices', JSON.stringify(defaultNotices));
        localStorage.setItem('settings', JSON.stringify({
            audioVolume: 80,
            audioVoice: 'female',
            audioSpeed: 1,
            scrollSpeed: 'normal',
            autoCallInterval: 120,
            autoCallEnabled: true,
            themeColor: 'blue',
            fontSize: 'medium',
            darkMode: true
        }));
    }
    
    getDoctors() {
        return JSON.parse(localStorage.getItem('doctors') || '[]');
    }
    
    getCurrentTreatment() {
        return JSON.parse(localStorage.getItem('currentTreatment') || '[]');
    }
    
    getWaitingList() {
        return JSON.parse(localStorage.getItem('waitingList') || '[]');
    }
    
    getImages() {
        return JSON.parse(localStorage.getItem('images') || '[]');
    }
    
    getNotices() {
        return JSON.parse(localStorage.getItem('notices') || '[]');
    }
    
    getSettings() {
        return JSON.parse(localStorage.getItem('settings') || '{}');
    }
    
    getCurrentCall() {
        return JSON.parse(localStorage.getItem('currentCall') || '{}');
    }
    
    getEmergencyMessage() {
        return localStorage.getItem('emergencyMessage') || '';
    }
    
    setupBroadcastListener() {
        this.broadcastChannel.onmessage = (event) => {
            console.log('Broadcast message received:', event.data);
            this.handleBroadcastMessage(event.data);
        };
    }
    
    handleBroadcastMessage(message) {
        const { type, data } = message;
        
        switch (type) {
            case 'update-doctors':
                this.updateDoctorsDisplay();
                break;
            case 'update-treatment':
                this.updateTreatmentDisplay();
                break;
            case 'update-waiting':
                this.updateWaitingDisplay();
                break;
            case 'update-images':
                this.updateImageSlider();
                break;
            case 'update-notices':
                this.updateNoticeBar();
                break;
            case 'emergency-message':
                this.showEmergencyMessage(data.message, data.duration);
                break;
            case 'clear-emergency':
                this.hideEmergencyMessage();
                break;
            case 'call-patient':
                this.callPatient(data.token, data.patientName, data.room);
                break;
            case 'update-settings':
                this.applySettings();
                break;
        }
    }
}

// UI ম্যানেজমেন্ট ক্লাস
class UIManager {
    constructor() {
        this.storage = new DataStorage();
        this.currentSlideIndex = 0;
        this.slideInterval = null;
        this.currentAnnouncement = null;
        this.speechSynthesis = window.speechSynthesis;
        this.init();
    }
    
    init() {
        this.loadAllData();
        this.setupEventListeners();
        this.setupTimers();
        this.applySettings();
    }
    
    loadAllData() {
        this.updateDoctorsDisplay();
        this.updateTreatmentDisplay();
        this.updateWaitingDisplay();
        this.updateImageSlider();
        this.updateNoticeBar();
        this.updateDateTime();
        this.updateWeather();
        this.updateCurrentCall();
        
        const emergencyMessage = this.storage.getEmergencyMessage();
        if (emergencyMessage) {
            this.showEmergencyMessage(emergencyMessage, 0);
        }
    }
    
    setupEventListeners() {
        // টোকেন কল পুনরাবৃত্তি বাটন
        document.getElementById('repeat-call-btn').addEventListener('click', () => {
            this.repeatLastCall();
        });
        
        // বর্তমান কল ডিসপ্লে আপডেট
        this.updateCurrentCall();
    }
    
    setupTimers() {
        // সময় আপডেট
        setInterval(() => {
            this.updateDateTime();
        }, 1000);
        
        // ছবি স্লাইডার টাইমার
        this.startImageSlider();
        
        // আবহাওয়া আপডেট (প্রতি ১০ মিনিটে)
        setInterval(() => {
            this.updateWeather();
        }, 600000);
        
        // স্বয়ংক্রিয় রোগী কলিং (যদি সক্রিয় থাকে)
        this.setupAutoCalling();
    }
    
    // ডাক্তার তালিকা আপডেট
    updateDoctorsDisplay() {
        const doctors = this.storage.getDoctors();
        const doctorsList = document.getElementById('doctors-list');
        
        if (!doctorsList) return;
        
        doctorsList.innerHTML = '';
        
        doctors.forEach(doctor => {
            const doctorItem = document.createElement('div');
            doctorItem.className = 'doctor-item';
            
            let statusClass = 'status-available';
            let statusText = 'সেবা প্রদান করছেন';
            
            if (doctor.status === 'busy') {
                statusClass = 'status-busy';
                statusText = 'ব্যস্ত';
            } else if (doctor.status === 'break') {
                statusClass = 'status-break';
                statusText = 'বিরতিতে';
            }
            
            doctorItem.innerHTML = `
                <div class="doctor-name">${doctor.name}</div>
                <div class="doctor-specialty">${doctor.specialty}</div>
                <div class="doctor-room">
                    <span class="room-number">রুম: ${doctor.room}</span>
                    <span class="doctor-status ${statusClass}">${statusText}</span>
                </div>
            `;
            
            doctorsList.appendChild(doctorItem);
        });
    }
    
    // চলমান চিকিৎসা আপডেট
    updateTreatmentDisplay() {
        const treatments = this.storage.getCurrentTreatment();
        const treatmentTable = document.getElementById('treatment-table');
        
        if (!treatmentTable) return;
        
        treatmentTable.innerHTML = '';
        
        treatments.forEach(treatment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${treatment.patientName}</td>
                <td>${treatment.patientId}</td>
                <td>${treatment.unit}</td>
                <td>${treatment.doctor}</td>
            `;
            treatmentTable.appendChild(row);
        });
    }
    
    // অপেক্ষমাণ তালিকা আপডেট
    updateWaitingDisplay() {
        const waitingList = this.storage.getWaitingList();
        const waitingContainer = document.getElementById('waiting-list');
        
        if (!waitingContainer) return;
        
        waitingContainer.innerHTML = '';
        
        waitingList.forEach((item, index) => {
            const waitingItem = document.createElement('div');
            waitingItem.className = `waiting-item ${item.priority}`;
            
            waitingItem.innerHTML = `
                <div class="waiting-serial">${item.token}</div>
                <div class="waiting-name">${item.patientName}</div>
                <div class="waiting-doctor">${item.doctor || 'যেকোনো ডাক্তার'}</div>
            `;
            
            waitingContainer.appendChild(waitingItem);
        });
    }
    
    // ছবি স্লাইডার আপডেট
    updateImageSlider() {
        const images = this.storage.getImages();
        const sliderContainer = document.getElementById('slider-container');
        
        if (!sliderContainer || images.length === 0) return;
        
        sliderContainer.innerHTML = '';
        
        images.forEach((image, index) => {
            const imgElement = document.createElement('img');
            imgElement.className = 'slider-image';
            imgElement.src = image.url;
            imgElement.alt = image.title || 'স্লাইডার ছবি';
            
            if (index === 0) {
                imgElement.classList.add('active');
            }
            
            sliderContainer.appendChild(imgElement);
        });
        
        // স্লাইডার রিস্টার্ট করুন
        this.stopImageSlider();
        this.startImageSlider();
    }
    
    startImageSlider() {
        const images = document.querySelectorAll('.slider-image');
        if (images.length === 0) return;
        
        this.stopImageSlider();
        
        this.slideInterval = setInterval(() => {
            images[this.currentSlideIndex].classList.remove('active');
            this.currentSlideIndex = (this.currentSlideIndex + 1) % images.length;
            images[this.currentSlideIndex].classList.add('active');
        }, 5000); // প্রতি ৫ সেকেন্ডে পরিবর্তন
    }
    
    stopImageSlider() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }
    
    // নোটিশ বার আপডেট
    updateNoticeBar() {
        const notices = this.storage.getNotices();
        const noticeContent = document.getElementById('notice-content');
        
        if (!noticeContent) return;
        
        noticeContent.innerHTML = '';
        
        if (notices.length === 0) {
            const defaultNotice = document.createElement('div');
            defaultNotice.className = 'notice-text';
            defaultNotice.textContent = 'স্বাগতম স্মাইল এক্সপার্ট ডেন্টাল ক্লিনিকে। আপনার সুস্থ হাসিই আমাদের অঙ্গীকার।';
            noticeContent.appendChild(defaultNotice);
            return;
        }
        
        // সমস্ত নোটিশ একসাথে যোগ করুন
        const noticeText = document.createElement('div');
        noticeText.className = 'notice-text';
        
        let allNotices = '';
        notices.forEach(notice => {
            allNotices += ` • ${notice.text}     `;
        });
        
        noticeText.textContent = allNotices;
        noticeContent.appendChild(noticeText);
    }
    
    // তারিখ ও সময় আপডেট
    updateDateTime() {
        const now = new Date();
        
        // ইংরেজি তারিখ ও সময়
        const englishDate = document.getElementById('english-date');
        const englishTime = document.getElementById('english-time');
        
        if (englishDate) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            englishDate.textContent = now.toLocaleDateString('en-US', options);
        }
        
        if (englishTime) {
            englishTime.textContent = now.toLocaleTimeString('en-US', { hour12: true });
        }
        
        // বাংলা তারিখ (সরলীকৃত)
        const bengaliDate = document.getElementById('bengali-date');
        if (bengaliDate) {
            const banglaMonths = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];
            const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
            
            const day = banglaDays[now.getDay()];
            const date = now.getDate();
            const month = banglaMonths[now.getMonth()];
            const year = now.getFullYear() - 593; // সরলীকৃত বাংলা সাল
            
            bengaliDate.textContent = `${day}, ${date} ${month} ${year}`;
        }
        
        // হিজরি তারিখ (সরলীকৃত)
        const hijriDate = document.getElementById('hijri-date');
        if (hijriDate) {
            const hijriYear = Math.floor((now.getFullYear() - 622) * 1.03);
            const hijriMonths = ['মুহররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান', 'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ'];
            const hijriMonth = hijriMonths[now.getMonth()];
            const hijriDay = now.getDate();
            
            hijriDate.textContent = `${hijriDay} ${hijriMonth} ${hijriYear} হিজরি`;
        }
    }
    
    // আবহাওয়া আপডেট (ডেমো ডেটা - বাস্তবে API ব্যবহার করুন)
    async updateWeather() {
        const temperatureElement = document.getElementById('temperature');
        const weatherDescElement = document.getElementById('weather-desc');
        const weatherIconElement = document.getElementById('weather-icon');
        
        if (!temperatureElement || !weatherDescElement || !weatherIconElement) return;
        
        try {
            // ডেমো ডেটা - বাস্তব প্রয়োগের জন্য OpenWeatherMap API ব্যবহার করুন
            const demoWeather = {
                temperature: 28,
                description: 'আংশিক মেঘলা',
                icon: 'wi-day-cloudy'
            };
            
            temperatureElement.textContent = `${demoWeather.temperature}°C`;
            weatherDescElement.textContent = demoWeather.description;
            weatherIconElement.className = `wi ${demoWeather.icon}`;
            
        } catch (error) {
            console.error('আবহাওয়া তথ্য লোড করতে ব্যর্থ:', error);
            temperatureElement.textContent = '--°C';
            weatherDescElement.textContent = 'তথ্য লোড ব্যর্থ';
            weatherIconElement.className = 'wi wi-na';
        }
    }
    
    // জরুরি বার্তা প্রদর্শন
    showEmergencyMessage(message, duration = 30) {
        const emergencyAlert = document.getElementById('emergency-alert');
        const emergencyText = document.getElementById('emergency-text');
        
        if (!emergencyAlert || !emergencyText) return;
        
        emergencyText.textContent = message;
        emergencyAlert.classList.remove('hidden');
        
        // বার্তা সংরক্ষণ করুন
        localStorage.setItem('emergencyMessage', message);
        
        // সময় নির্ধারণ থাকলে স্বয়ংক্রিয়ভাবে সরিয়ে দিন
        if (duration > 0) {
            setTimeout(() => {
                this.hideEmergencyMessage();
            }, duration * 1000);
        }
    }
    
    hideEmergencyMessage() {
        const emergencyAlert = document.getElementById('emergency-alert');
        if (emergencyAlert) {
            emergencyAlert.classList.add('hidden');
            localStorage.removeItem('emergencyMessage');
        }
    }
    
    // টোকেন কলিং
    callPatient(token, patientName, room = '১') {
        const currentTokenElement = document.getElementById('current-token');
        const currentPatientElement = document.getElementById('current-patient');
        const currentRoomElement = document.getElementById('current-room');
        
        if (currentTokenElement) currentTokenElement.textContent = token;
        if (currentPatientElement) currentPatientElement.textContent = patientName;
        if (currentRoomElement) currentRoomElement.textContent = room;
        
        // বর্তমান কল সংরক্ষণ করুন
        localStorage.setItem('currentCall', JSON.stringify({ token, patientName, room }));
        
        // অডিও ঘোষণা
        this.makeAnnouncement(token, patientName, room);
    }
    
    repeatLastCall() {
        const currentCall = this.storage.getCurrentCall();
        if (currentCall && currentCall.token) {
            this.callPatient(currentCall.token, currentCall.patientName, currentCall.room);
        } else {
            this.makeAnnouncement(1, "ডেমো রোগী", "১");
        }
    }
    
    updateCurrentCall() {
        const currentCall = this.storage.getCurrentCall();
        if (currentCall && currentCall.token) {
            const currentTokenElement = document.getElementById('current-token');
            const currentPatientElement = document.getElementById('current-patient');
            const currentRoomElement = document.getElementById('current-room');
            
            if (currentTokenElement) currentTokenElement.textContent = currentCall.token;
            if (currentPatientElement) currentPatientElement.textContent = currentCall.patientName;
            if (currentRoomElement) currentRoomElement.textContent = currentCall.room;
        }
    }
    
    // অডিও ঘোষণা (Web Speech API)
    makeAnnouncement(token, patientName, room) {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }
        
        const settings = this.storage.getSettings();
        const utterance = new SpeechSynthesisUtterance();
        
        // বাংলা টেক্সট
        const text = `পরবর্তী রোগী ${patientName}, টোকেন নম্বর ${token}, রুম নম্বর ${room} এ আসুন।`;
        utterance.text = text;
        utterance.lang = 'bn-BD';
        utterance.rate = settings.audioSpeed || 1;
        utterance.volume = (settings.audioVolume || 80) / 100;
        
        // ভয়েস সিলেকশন
        const voices = this.speechSynthesis.getVoices();
        const banglaVoice = voices.find(voice => voice.lang === 'bn-BD' || voice.lang.startsWith('bn-'));
        
        if (banglaVoice) {
            utterance.voice = banglaVoice;
        } else if (settings.audioVoice === 'male') {
            const maleVoice = voices.find(voice => voice.name.toLowerCase().includes('male'));
            if (maleVoice) utterance.voice = maleVoice;
        } else {
            const femaleVoice = voices.find(voice => voice.name.toLowerCase().includes('female'));
            if (femaleVoice) utterance.voice = femaleVoice;
        }
        
        this.speechSynthesis.speak(utterance);
        this.currentAnnouncement = utterance;
        
        utterance.onend = () => {
            console.log('Announcement completed');
            this.currentAnnouncement = null;
        };
    }
    
    // স্বয়ংক্রিয় কলিং সেটআপ
    setupAutoCalling() {
        const settings = this.storage.getSettings();
        if (settings.autoCallEnabled) {
            const interval = (settings.autoCallInterval || 120) * 1000; // মিলিসেকেন্ডে
            
            setInterval(() => {
                const waitingList = this.storage.getWaitingList();
                if (waitingList.length > 0) {
                    const nextPatient = waitingList[0];
                    
                    // পরবর্তী রোগীকে কল করুন
                    this.callPatient(nextPatient.token, nextPatient.patientName, "১");
                    
                    // অপেক্ষমাণ তালিকা থেকে সরিয়ে দিন
                    const updatedList = waitingList.slice(1);
                    localStorage.setItem('waitingList', JSON.stringify(updatedList));
                    this.updateWaitingDisplay();
                    
                    // এডমিন প্যানেলে ব্রডকাস্ট করুন
                    this.storage.broadcastChannel.postMessage({
                        type: 'update-waiting'
                    });
                }
            }, interval);
        }
    }
    
    // সেটিংস প্রয়োগ
    applySettings() {
        const settings = this.storage.getSettings();
        
        // থিম কালার
        document.documentElement.style.setProperty('--primary-color', this.getColorValue(settings.themeColor || 'blue'));
        
        // ফন্ট সাইজ
        const fontSize = settings.fontSize || 'medium';
        const sizeMap = { small: '14px', medium: '16px', large: '18px' };
        document.body.style.fontSize = sizeMap[fontSize];
        
        // ডার্ক/লাইট মোড
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
    
    getColorValue(colorName) {
        const colors = {
            blue: '#2a9d8f',
            green: '#4CAF50',
            teal: '#009688',
            purple: '#9C27B0'
        };
        return colors[colorName] || '#2a9d8f';
    }
}

// অ্যাপ্লিকেশন শুরু করুন
document.addEventListener('DOMContentLoaded', () => {
    const uiManager = new UIManager();
    
    // ব্রাউজার ট্যাব/উইন্ডো আনলোড হলে স্লাইডার বন্ধ করুন
    window.addEventListener('beforeunload', () => {
        uiManager.stopImageSlider();
        if (uiManager.speechSynthesis.speaking) {
            uiManager.speechSynthesis.cancel();
        }
    });
});
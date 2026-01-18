// Admin Panel Script - Smile Xpert System

class AdminManager {
    constructor() {
        this.storage = new DataStorage();
        this.currentTab = 'doctors-tab';
        this.init();
    }
    
    init() {
        this.loadAllData();
        this.setupTabNavigation();
        this.setupEventListeners();
        this.setupFormHandlers();
        this.updateSystemStatus();
        
        // ব্রডকাস্ট চ্যানেলের মাধ্যমে TV ডিসপ্লে আপডেট করুন
        this.broadcastChannel = new BroadcastChannel('smile-xpert-channel');
    }
    
    loadAllData() {
        this.updateDoctorsTable();
        this.updateTreatmentTable();
        this.updateWaitingTable();
        this.updateImagesGrid();
        this.updateNoticesTable();
        this.populateDoctorDropdowns();
        this.updateSettingsForm();
    }
    
    setupTabNavigation() {
        const tabLinks = document.querySelectorAll('.admin-nav li');
        tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                const tabId = link.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }
    
    switchTab(tabId) {
        // কারেন্ট ট্যাব হাইড করুন
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // নেভিগেশন আইটেম আপডেট করুন
        document.querySelectorAll('.admin-nav li').forEach(item => {
            item.classList.remove('active');
        });
        
        // নতুন ট্যাব শো করুন
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.admin-nav li[data-tab="${tabId}"]`).classList.add('active');
        
        this.currentTab = tabId;
    }
    
    setupEventListeners() {
        // জরুরি বার্তা বাটন
        document.querySelectorAll('.emergency-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.getAttribute('data-message');
                this.sendEmergencyMessage(message, 30);
            });
        });
        
        // কাস্টম জরুরি বার্তা ফর্ম
        document.getElementById('custom-emergency-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const message = document.getElementById('custom-message').value;
            const duration = parseInt(document.getElementById('emergency-duration').value);
            this.sendEmergencyMessage(message, duration);
        });
        
        // জরুরি বার্তা মুছুন
        document.getElementById('clear-emergency-btn').addEventListener('click', () => {
            this.clearEmergencyMessage();
        });
        
        // পরবর্তী রোগী কল করুন
        document.getElementById('call-next-btn').addEventListener('click', () => {
            this.callNextPatient();
        });
        
        // অপেক্ষমাণ তালিকা খালি করুন
        document.getElementById('clear-waiting-btn').addEventListener('click', () => {
            if (confirm('আপনি কি নিশ্চিত যে আপনি অপেক্ষমাণ তালিকা খালি করতে চান?')) {
                this.clearWaitingList();
            }
        });
        
        // ডেটা ম্যানেজমেন্ট বাটন
        document.getElementById('export-data-btn').addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('import-data-btn').addEventListener('click', () => {
            document.getElementById('import-file-input')?.click();
        });
        
        document.getElementById('reset-data-btn').addEventListener('click', () => {
            if (confirm('আপনি কি নিশ্চিত যে আপনি সমস্ত ডেটা রিসেট করতে চান? এটি পূর্বের সমস্ত তথ্য মুছে ফেলবে।')) {
                this.resetData();
            }
        });
        
        // সেটিংস ফর্ম ইভেন্ট
        this.setupSettingsListeners();
    }
    
    setupFormHandlers() {
        // ডাক্তার যোগ ফর্ম
        document.getElementById('add-doctor-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addDoctor();
        });
        
        // চিকিৎসা যোগ ফর্ম
        document.getElementById('add-treatment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTreatment();
        });
        
        // অপেক্ষমাণ রোগী যোগ ফর্ম
        document.getElementById('add-waiting-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addWaitingPatient();
        });
        
        // ছবি আপলোড ফর্ম
        document.getElementById('upload-image-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addImage();
        });
        
        // নোটিশ যোগ ফর্ম
        document.getElementById('add-notice-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNotice();
        });
    }
    
    // ডাক্তার ম্যানেজমেন্ট
    updateDoctorsTable() {
        const doctors = this.storage.getDoctors();
        const tableBody = document.getElementById('doctors-table-body');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        doctors.forEach((doctor, index) => {
            const row = document.createElement('tr');
            
            let statusText = 'সেবা প্রদান করছেন';
            if (doctor.status === 'busy') statusText = 'ব্যস্ত';
            else if (doctor.status === 'break') statusText = 'বিরতিতে';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${doctor.name}</td>
                <td>${doctor.specialty}</td>
                <td>${doctor.room}</td>
                <td>${statusText}</td>
                <td class="action-buttons">
                    <button class="action-btn edit-btn" data-id="${doctor.id}">
                        <i class="fas fa-edit"></i> সম্পাদনা
                    </button>
                    <button class="action-btn delete-btn" data-id="${doctor.id}">
                        <i class="fas fa-trash"></i> মুছুন
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // সম্পাদনা/মুছুন বাটনে ইভেন্ট যোগ করুন
        this.attachDoctorActions();
        this.updateSystemStatus();
    }
    
    attachDoctorActions() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                this.editDoctor(id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                this.deleteDoctor(id);
            });
        });
    }
    
    addDoctor() {
        const name = document.getElementById('doctor-name').value;
        const specialty = document.getElementById('doctor-specialty').value;
        const room = document.getElementById('doctor-room').value;
        const status = document.getElementById('doctor-status').value;
        
        if (!name || !specialty || !room) {
            alert('দয়া করে সকল প্রয়োজনীয় তথ্য প্রদান করুন।');
            return;
        }
        
        const doctors = this.storage.getDoctors();
        const newId = doctors.length > 0 ? Math.max(...doctors.map(d => d.id)) + 1 : 1;
        
        const newDoctor = {
            id: newId,
            name,
            specialty,
            room,
            status
        };
        
        doctors.push(newDoctor);
        localStorage.setItem('doctors', JSON.stringify(doctors));
        
        // ফর্ম রিসেট করুন
        document.getElementById('add-doctor-form').reset();
        
        // টেবিল আপডেট করুন
        this.updateDoctorsTable();
        
        // ডাক্তার ড্রপডাউন পপুলেট করুন
        this.populateDoctorDropdowns();
        
        // TV ডিসপ্লে আপডেট করুন
        this.broadcastUpdate('update-doctors');
        
        alert('ডাক্তার সফলভাবে যোগ করা হয়েছে।');
    }
    
    editDoctor(id) {
        const doctors = this.storage.getDoctors();
        const doctor = doctors.find(d => d.id === id);
        
        if (!doctor) return;
        
        // ফর্ম পপুলেট করুন (সরলীকৃত - বাস্তবে মডাল ব্যবহার করুন)
        document.getElementById('doctor-name').value = doctor.name;
        document.getElementById('doctor-specialty').value = doctor.specialty;
        document.getElementById('doctor-room').value = doctor.room;
        document.getElementById('doctor-status').value = doctor.status;
        
        // ডাক্তার মুছে নতুন যোগ করুন
        this.deleteDoctor(id, false);
    }
    
    deleteDoctor(id, showAlert = true) {
        const doctors = this.storage.getDoctors();
        const filteredDoctors = doctors.filter(d => d.id !== id);
        
        localStorage.setItem('doctors', JSON.stringify(filteredDoctors));
        this.updateDoctorsTable();
        this.populateDoctorDropdowns();
        this.broadcastUpdate('update-doctors');
        
        if (showAlert) {
            alert('ডাক্তার সফলভাবে মুছে ফেলা হয়েছে।');
        }
    }
    
    // চিকিৎসা ম্যানেজমেন্ট
    updateTreatmentTable() {
        const treatments = this.storage.getCurrentTreatment();
        const tableBody = document.getElementById('treatment-table-body');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        treatments.forEach((treatment, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${treatment.patientName}</td>
                <td>${treatment.patientId}</td>
                <td>${treatment.unit}</td>
                <td>${treatment.doctor}</td>
                <td>${treatment.startTime}</td>
                <td class="action-buttons">
                    <button class="action-btn delete-btn" data-id="${treatment.id}">
                        <i class="fas fa-trash"></i> মুছুন
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // মুছুন বাটনে ইভেন্ট যোগ করুন
        this.attachTreatmentActions();
        this.updateSystemStatus();
    }
    
    attachTreatmentActions() {
        document.querySelectorAll('#treatment-table-body .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                this.deleteTreatment(id);
            });
        });
    }
    
    addTreatment() {
        const patientName = document.getElementById('patient-name').value;
        const patientId = document.getElementById('patient-id').value;
        const unitNumber = document.getElementById('unit-number').value;
        const doctor = document.getElementById('treatment-doctor').value;
        
        if (!patientName || !patientId || !unitNumber || !doctor) {
            alert('দয়া করে সকল প্রয়োজনীয় তথ্য প্রদান করুন।');
            return;
        }
        
        const treatments = this.storage.getCurrentTreatment();
        const newId = treatments.length > 0 ? Math.max(...treatments.map(t => t.id)) + 1 : 1;
        
        const now = new Date();
        const startTime = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
        
        const newTreatment = {
            id: newId,
            patientName,
            patientId,
            unit: unitNumber,
            doctor,
            startTime
        };
        
        treatments.push(newTreatment);
        localStorage.setItem('currentTreatment', JSON.stringify(treatments));
        
        // ফর্ম রিসেট করুন
        document.getElementById('add-treatment-form').reset();
        
        // টেবিল আপডেট করুন
        this.updateTreatmentTable();
        
        // TV ডিসপ্লে আপডেট করুন
        this.broadcastUpdate('update-treatment');
        
        alert('চিকিৎসা তথ্য সফলভাবে যোগ করা হয়েছে।');
    }
    
    deleteTreatment(id) {
        const treatments = this.storage.getCurrentTreatment();
        const filteredTreatments = treatments.filter(t => t.id !== id);
        
        localStorage.setItem('currentTreatment', JSON.stringify(filteredTreatments));
        this.updateTreatmentTable();
        this.broadcastUpdate('update-treatment');
        
        alert('চিকিৎসা তথ্য সফলভাবে মুছে ফেলা হয়েছে।');
    }
    
    // অপেক্ষমাণ তালিকা ম্যানেজমেন্ট
    updateWaitingTable() {
        const waitingList = this.storage.getWaitingList();
        const tableBody = document.getElementById('waiting-table-body');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        waitingList.forEach((patient, index) => {
            const row = document.createElement('tr');
            
            let priorityText = 'সাধারণ';
            let priorityClass = '';
            
            if (patient.priority === 'priority') {
                priorityText = 'অগ্রাধিকার';
                priorityClass = 'priority-text';
            } else if (patient.priority === 'emergency') {
                priorityText = 'জরুরি';
                priorityClass = 'emergency-text';
            }
            
            row.innerHTML = `
                <td>${patient.token}</td>
                <td>${patient.patientName}</td>
                <td>${patient.doctor || 'যেকোনো ডাক্তার'}</td>
                <td class="${priorityClass}">${priorityText}</td>
                <td>${patient.time}</td>
                <td class="action-buttons">
                    <button class="action-btn call-btn-small" data-id="${patient.id}">
                        <i class="fas fa-bullhorn"></i> কল করুন
                    </button>
                    <button class="action-btn delete-btn" data-id="${patient.id}">
                        <i class="fas fa-trash"></i> মুছুন
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // অপশন বাটনে ইভেন্ট যোগ করুন
        this.attachWaitingActions();
        this.updateSystemStatus();
        
        // পরবর্তী টোকেন নম্বর সেট করুন
        this.updateNextToken();
    }
    
    attachWaitingActions() {
        document.querySelectorAll('#waiting-table-body .call-btn-small').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                this.callSpecificPatient(id);
            });
        });
        
        document.querySelectorAll('#waiting-table-body .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                this.deleteWaitingPatient(id);
            });
        });
    }
    
    addWaitingPatient() {
        const patientName = document.getElementById('waiting-patient-name').value;
        const doctor = document.getElementById('waiting-doctor').value;
        const priority = document.getElementById('waiting-priority').value;
        
        if (!patientName) {
            alert('দয়া করে রোগীর নাম প্রদান করুন।');
            return;
        }
        
        const waitingList = this.storage.getWaitingList();
        const nextToken = waitingList.length > 0 ? Math.max(...waitingList.map(p => p.token)) + 1 : 1;
        const newId = waitingList.length > 0 ? Math.max(...waitingList.map(p => p.id)) + 1 : 1;
        
        const now = new Date();
        const time = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
        
        const newPatient = {
            id: newId,
            token: nextToken,
            patientName,
            doctor,
            priority,
            time
        };
        
        waitingList.push(newPatient);
        localStorage.setItem('waitingList', JSON.stringify(waitingList));
        
        // ফর্ম রিসেট করুন
        document.getElementById('add-waiting-form').reset();
        
        // টেবিল আপডেট করুন
        this.updateWaitingTable();
        
        // TV ডিসপ্লে আপডেট করুন
        this.broadcastUpdate('update-waiting');
        
        alert('রোগী সফলভাবে অপেক্ষমাণ তালিকায় যোগ করা হয়েছে।');
    }
    
    callSpecificPatient(id) {
        const waitingList = this.storage.getWaitingList();
        const patient = waitingList.find(p => p.id === id);
        
        if (!patient) return;
        
        // রোগীকে কল করুন
        this.broadcastChannel.postMessage({
            type: 'call-patient',
            data: {
                token: patient.token,
                patientName: patient.patientName,
                room: "১"
            }
        });
        
        // অপেক্ষমাণ তালিকা থেকে সরিয়ে দিন
        const updatedList = waitingList.filter(p => p.id !== id);
        localStorage.setItem('waitingList', JSON.stringify(updatedList));
        this.updateWaitingTable();
        this.broadcastUpdate('update-waiting');
        
        alert(`রোগী ${patient.patientName} (টোকেন: ${patient.token}) কে কল করা হয়েছে।`);
    }
    
    callNextPatient() {
        const waitingList = this.storage.getWaitingList();
        if (waitingList.length === 0) {
            alert('অপেক্ষমাণ তালিকায় কোন রোগী নেই।');
            return;
        }
        
        const nextPatient = waitingList[0];
        this.callSpecificPatient(nextPatient.id);
    }
    
    deleteWaitingPatient(id) {
        const waitingList = this.storage.getWaitingList();
        const filteredList = waitingList.filter(p => p.id !== id);
        
        localStorage.setItem('waitingList', JSON.stringify(filteredList));
        this.updateWaitingTable();
        this.broadcastUpdate('update-waiting');
        
        alert('রোগী সফলভাবে অপেক্ষমাণ তালিকা থেকে মুছে ফেলা হয়েছে।');
    }
    
    clearWaitingList() {
        localStorage.setItem('waitingList', JSON.stringify([]));
        this.updateWaitingTable();
        this.broadcastUpdate('update-waiting');
        
        alert('অপেক্ষমাণ তালিকা খালি করা হয়েছে।');
    }
    
    updateNextToken() {
        const waitingList = this.storage.getWaitingList();
        const nextToken = waitingList.length > 0 ? Math.max(...waitingList.map(p => p.token)) + 1 : 1;
        document.getElementById('waiting-token').value = nextToken;
    }
    
    // ছবি স্লাইডার ম্যানেজমেন্ট
    updateImagesGrid() {
        const images = this.storage.getImages();
        const imagesGrid = document.getElementById('images-grid');
        
        if (!imagesGrid) return;
        
        imagesGrid.innerHTML = '';
        
        images.forEach(image => {
            const imageCard = document.createElement('div');
            imageCard.className = 'image-card';
            
            imageCard.innerHTML = `
                <img src="${image.url}" alt="${image.title || 'ছবি'}">
                <div class="image-card-body">
                    <div class="image-card-title">${image.title || 'শিরোনাম নেই'}</div>
                    <div class="image-card-description">${image.description || 'বিবরণ নেই'}</div>
                    <div class="action-buttons">
                        <button class="action-btn delete-btn" data-id="${image.id}">
                            <i class="fas fa-trash"></i> মুছুন
                        </button>
                    </div>
                </div>
            `;
            
            imagesGrid.appendChild(imageCard);
        });
        
        // মুছুন বাটনে ইভেন্ট যোগ করুন
        this.attachImageActions();
    }
    
    attachImageActions() {
        document.querySelectorAll('#images-grid .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                this.deleteImage(id);
            });
        });
    }
    
    addImage() {
        const imageUrl = document.getElementById('image-url').value;
        const imageFile = document.getElementById('image-file').files[0];
        const title = document.getElementById('image-title').value;
        const description = document.getElementById('image-description').value;
        const displayTime = parseInt(document.getElementById('display-time').value);
        
        let finalUrl = imageUrl;
        
        // যদি ফাইল আপলোড করা হয়
        if (imageFile) {
            // বাস্তব প্রয়োগে, ফাইল সার্ভারে আপলোড করুন এবং URL পান
            // এখানে আমরা শুধু ডেমো URL ব্যবহার করব
            finalUrl = URL.createObjectURL(imageFile);
        }
        
        if (!finalUrl) {
            alert('দয়া করে একটি ছবির URL প্রদান করুন বা ফাইল নির্বাচন করুন।');
            return;
        }
        
        const images = this.storage.getImages();
        const newId = images.length > 0 ? Math.max(...images.map(img => img.id)) + 1 : 1;
        
        const newImage = {
            id: newId,
            url: finalUrl,
            title: title || 'নতুন ছবি',
            description: description || '',
            displayTime: displayTime || 5
        };
        
        images.push(newImage);
        localStorage.setItem('images', JSON.stringify(images));
        
        // ফর্ম রিসেট করুন
        document.getElementById('upload-image-form').reset();
        
        // গ্রিড আপডেট করুন
        this.updateImagesGrid();
        
        // TV ডিসপ্লে আপডেট করুন
        this.broadcastUpdate('update-images');
        
        alert('ছবি সফলভাবে যোগ করা হয়েছে।');
    }
    
    deleteImage(id) {
        const images = this.storage.getImages();
        const filteredImages = images.filter(img => img.id !== id);
        
        localStorage.setItem('images', JSON.stringify(filteredImages));
        this.updateImagesGrid();
        this.broadcastUpdate('update-images');
        
        alert('ছবি সফলভাবে মুছে ফেলা হয়েছে।');
    }
    
    // নোটিশ বার ম্যানেজমেন্ট
    updateNoticesTable() {
        const notices = this.storage.getNotices();
        const tableBody = document.getElementById('notices-table-body');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        notices.forEach(notice => {
            const row = document.createElement('tr');
            
            let typeText = 'সাধারণ তথ্য';
            if (notice.type === 'offer') typeText = 'বিশেষ অফার';
            else if (notice.type === 'warning') typeText = 'সতর্কতা';
            else if (notice.type === 'reminder') typeText = 'অনুস্মারক';
            
            row.innerHTML = `
                <td>${notice.text}</td>
                <td>${typeText}</td>
                <td>${notice.added}</td>
                <td>${notice.expires}</td>
                <td class="action-buttons">
                    <button class="action-btn delete-btn" data-id="${notice.id}">
                        <i class="fas fa-trash"></i> মুছুন
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // মুছুন বাটনে ইভেন্ট যোগ করুন
        this.attachNoticeActions();
    }
    
    attachNoticeActions() {
        document.querySelectorAll('#notices-table-body .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                this.deleteNotice(id);
            });
        });
    }
    
    addNotice() {
        const text = document.getElementById('notice-text').value;
        const type = document.getElementById('notice-type').value;
        const duration = parseInt(document.getElementById('notice-duration').value);
        
        if (!text) {
            alert('দয়া করে নোটিশ বার্তা প্রদান করুন।');
            return;
        }
        
        const notices = this.storage.getNotices();
        const newId = notices.length > 0 ? Math.max(...notices.map(n => n.id)) + 1 : 1;
        
        const now = new Date();
        const addedTime = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
        
        let expiresTime = 'অসীম';
        if (duration > 0) {
            const expireDate = new Date(now.getTime() + duration * 60000);
            expiresTime = expireDate.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
        }
        
        const newNotice = {
            id: newId,
            text,
            type,
            added: addedTime,
            expires: expiresTime
        };
        
        notices.push(newNotice);
        localStorage.setItem('notices', JSON.stringify(notices));
        
        // ফর্ম রিসেট করুন
        document.getElementById('add-notice-form').reset();
        
        // টেবিল আপডেট করুন
        this.updateNoticesTable();
        
        // TV ডিসপ্লে আপডেট করুন
        this.broadcastUpdate('update-notices');
        
        alert('নোটিশ সফলভাবে যোগ করা হয়েছে।');
    }
    
    deleteNotice(id) {
        const notices = this.storage.getNotices();
        const filteredNotices = notices.filter(n => n.id !== id);
        
        localStorage.setItem('notices', JSON.stringify(filteredNotices));
        this.updateNoticesTable();
        this.broadcastUpdate('update-notices');
        
        alert('নোটিশ সফলভাবে মুছে ফেলা হয়েছে।');
    }
    
    // জরুরি বার্তা ম্যানেজমেন্ট
    sendEmergencyMessage(message, duration) {
        // প্রিভিউ আপডেট করুন
        document.getElementById('preview-text').textContent = message;
        
        // TV ডিসপ্লেতে ব্রডকাস্ট করুন
        this.broadcastChannel.postMessage({
            type: 'emergency-message',
            data: {
                message,
                duration
            }
        });
        
        alert(`জরুরি বার্তা পাঠানো হয়েছে: "${message}"`);
        
        // ফর্ম রিসেট করুন (যদি কাস্টম বার্তা হয়)
        document.getElementById('custom-message').value = '';
    }
    
    clearEmergencyMessage() {
        // TV ডিসপ্লেতে ব্রডকাস্ট করুন
        this.broadcastChannel.postMessage({
            type: 'clear-emergency'
        });
        
        // প্রিভিউ রিসেট করুন
        document.getElementById('preview-text').textContent = 'জরুরি বার্তা এখানে দেখানো হবে';
        
        alert('জরুরি বার্তা মুছে ফেলা হয়েছে।');
    }
    
    // সিস্টেম স্ট্যাটাস আপডেট
    updateSystemStatus() {
        const doctors = this.storage.getDoctors();
        const treatments = this.storage.getCurrentTreatment();
        const waitingList = this.storage.getWaitingList();
        const currentCall = this.storage.getCurrentCall();
        
        document.getElementById('doctors-count').textContent = doctors.length;
        document.getElementById('patients-count').textContent = treatments.length;
        document.getElementById('waiting-count').textContent = waitingList.length;
        document.getElementById('calls-count').textContent = currentCall.token ? '1' : '0';
    }
    
    // ডাক্তার ড্রপডাউন পপুলেট
    populateDoctorDropdowns() {
        const doctors = this.storage.getDoctors();
        const doctorDropdowns = [
            document.getElementById('treatment-doctor'),
            document.getElementById('waiting-doctor')
        ];
        
        doctorDropdowns.forEach(dropdown => {
            if (!dropdown) return;
            
            // বর্তমান অপশনগুলো সংরক্ষণ করুন (প্রথমটি)
            const currentValue = dropdown.value;
            const firstOption = dropdown.options[0];
            
            // ড্রপডাউন খালি করুন
            dropdown.innerHTML = '';
            
            // প্রথম অপশন পুনরায় যোগ করুন
            if (firstOption) {
                dropdown.appendChild(firstOption.cloneNode(true));
            }
            
            // ডাক্তার তালিকা যোগ করুন
            doctors.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.name;
                option.textContent = doctor.name;
                dropdown.appendChild(option);
            });
            
            // পূর্বের মান পুনরায় সেট করুন
            dropdown.value = currentValue;
        });
    }
    
    // সেটিংস ম্যানেজমেন্ট
    updateSettingsForm() {
        const settings = this.storage.getSettings();
        
        document.getElementById('audio-volume').value = settings.audioVolume || 80;
        document.getElementById('volume-value').textContent = `${settings.audioVolume || 80}%`;
        document.getElementById('audio-voice').value = settings.audioVoice || 'female';
        document.getElementById('audio-speed').value = settings.audioSpeed || 1;
        document.getElementById('scroll-speed').value = settings.scrollSpeed || 'normal';
        document.getElementById('auto-call-interval').value = settings.autoCallInterval || 120;
        document.getElementById('auto-call-enabled').checked = settings.autoCallEnabled !== false;
        document.getElementById('theme-color').value = settings.themeColor || 'blue';
        document.getElementById('font-size').value = settings.fontSize || 'medium';
        document.getElementById('dark-mode').checked = settings.darkMode !== false;
        document.getElementById('auto-save').checked = settings.autoSave !== false;
    }
    
    setupSettingsListeners() {
        // ভলিউম স্লাইডার
        document.getElementById('audio-volume').addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('volume-value').textContent = `${value}%`;
            this.saveSetting('audioVolume', parseInt(value));
        });
        
        // অন্যান্য সেটিংস
        const settingsInputs = [
            'audio-voice', 'audio-speed', 'scroll-speed', 'theme-color', 'font-size'
        ];
        
        settingsInputs.forEach(inputId => {
            document.getElementById(inputId).addEventListener('change', (e) => {
                this.saveSetting(inputId.replace('-', ''), e.target.value);
            });
        });
        
        // সংখ্যাসূচক ইনপুট
        document.getElementById('auto-call-interval').addEventListener('change', (e) => {
            this.saveSetting('autoCallInterval', parseInt(e.target.value));
        });
        
        // চেকবক্স
        const checkboxes = ['auto-call-enabled', 'dark-mode', 'auto-save'];
        
        checkboxes.forEach(checkboxId => {
            document.getElementById(checkboxId).addEventListener('change', (e) => {
                this.saveSetting(checkboxId.replace('-', ''), e.target.checked);
            });
        });
    }
    
    saveSetting(key, value) {
        const settings = this.storage.getSettings();
        settings[key] = value;
        localStorage.setItem('settings', JSON.stringify(settings));
        
        // TV ডিসপ্লেতে ব্রডকাস্ট করুন
        this.broadcastChannel.postMessage({
            type: 'update-settings'
        });
    }
    
    // ডেটা এক্সপোর্ট/ইম্পোর্ট
    exportData() {
        const data = {
            doctors: this.storage.getDoctors(),
            currentTreatment: this.storage.getCurrentTreatment(),
            waitingList: this.storage.getWaitingList(),
            images: this.storage.getImages(),
            notices: this.storage.getNotices(),
            settings: this.storage.getSettings(),
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `smile-xpert-backup-${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        alert('ডেটা সফলভাবে এক্সপোর্ট করা হয়েছে।');
    }
    
    importData() {
        // বাস্তব প্রয়োগে, ফাইল নির্বাচনকারী দিয়ে এটি প্রয়োগ করুন
        alert('বাস্তব প্রয়োগে, ফাইল নির্বাচনকারী যোগ করুন এবং JSON ডেটা লোড করুন।');
    }
    
    resetData() {
        localStorage.clear();
        this.storage.setDefaultData();
        this.loadAllData();
        this.updateSystemStatus();
        
        // সমস্ত TV ডিসপ্লে আপডেট করুন
        this.broadcastUpdate('update-doctors');
        this.broadcastUpdate('update-treatment');
        this.broadcastUpdate('update-waiting');
        this.broadcastUpdate('update-images');
        this.broadcastUpdate('update-notices');
        this.broadcastUpdate('update-settings');
        
        alert('সমস্ত ডেটা রিসেট করা হয়েছে। ডিফল্ট মানগুলো লোড করা হয়েছে।');
    }
    
    // ব্রডকাস্ট হেল্পার
    broadcastUpdate(type) {
        this.broadcastChannel.postMessage({ type });
    }
}

// অ্যাডমিন ম্যানেজার শুরু করুন
document.addEventListener('DOMContentLoaded', () => {
    const adminManager = new AdminManager();
});
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. Dynamic Product Database & Rendering
    // ==========================================
    const defaultProductsSeed = [
        {
            id: "prod_1",
            badge: "สั่งตัดตามพื้นที่",
            image: "assets/cat_furniture.png",
            title: "โต๊ะกินข้าวไม้เนื้อแข็ง ขาเหล็กกล่อง 3 นิ้ว ทรง X-Shape พ่นสีฝุ่นพาวเดอร์โค้ต",
            price: "เริ่มต้น ฿8,500",
            sold: "ผลิต 7-14 วัน (มัดจำ 50%)",
            category: "furniture",
            stock: 0
        },
        {
            id: "prod_2",
            badge: "ออกแบบลายฟรี",
            image: "assets/cat_cnc.png",
            title: "แผ่นเหล็กฉลุลาย CNC แผงกั้นห้อง/ระเบียง ลายเรขาคณิตโมเดิร์น",
            price: "เริ่มต้น ฿1,500/ตร.ม.",
            sold: "ผลิต 10 วัน (มัดจำ 50%)",
            category: "cnc",
            stock: 0
        },
        {
            id: "prod_3",
            badge: "ประเมินหน้างาน",
            image: "assets/cat_glass_door.png",
            title: "ประตูบานเลื่อนเหล็ก กระจกใส กรอบบางสไตล์โฮมคาเฟ่ ดิบเท่กั้นห้องแสงธรรมชาติ",
            price: "ประเมินตามขนาด",
            sold: "รวมบริการติดตั้งหน้างาน",
            category: "architecture",
            stock: 0
        },
        {
            id: "prod_4",
            badge: "สั่งตัดตามพื้นที่",
            image: "assets/hero_background.png",
            title: "ชั้นวางของเหล็กตะแกรงฉีก 5 ชั้น โครงสร้างรับน้ำหนักสูง แข็งแรงพิเศษ",
            price: "เริ่มต้น ฿4,200",
            sold: "ผลิต 7 วัน (มัดจำ 50%)",
            category: "furniture",
            stock: 3
        },
        {
            id: "prod_5",
            badge: "สั่งตัดตามพื้นที่",
            image: "assets/cat_grille.png",
            title: "โครงเตียงเหล็ก 6 ฟุต สไตล์อินดัสเทรียลลอฟท์ ถอดประกอบได้ ไร้เสียงรบกวน",
            price: "เริ่มต้น ฿11,000",
            sold: "ผลิต 14 วัน (มัดจำ 50%)",
            category: "grille",
            stock: 2
        }
    ];

    const renderProductsFrontend = () => {
        const grid = document.getElementById('product-grid-list');
        if (!grid) return;

        let db = JSON.parse(localStorage.getItem('shop_products_db'));
        if (!db || db.length === 0) {
            db = defaultProductsSeed;
            localStorage.setItem('shop_products_db', JSON.stringify(db));
        }

        const renderList = (products) => {
            grid.innerHTML = '';
            products.forEach(prod => {
                const stockVal = typeof prod.stock !== 'undefined' ? parseInt(prod.stock) : 0;
                const stockBadge = stockVal > 0
                    ? `<div class="p-stock" style="font-size: 0.72rem; font-weight: 600; padding: 3px 8px; border-radius: 4px; display: inline-block; margin-top: 4px; margin-bottom: 6px; align-self: flex-start; background: rgba(16, 185, 129, 0.15); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.25);">🟢 พร้อมส่ง ${stockVal} ชิ้น</div>`
                    : `<div class="p-stock" style="font-size: 0.72rem; font-weight: 600; padding: 3px 8px; border-radius: 4px; display: inline-block; margin-top: 4px; margin-bottom: 6px; align-self: flex-start; background: rgba(249, 115, 22, 0.15); color: #fdba74; border: 1px solid rgba(249, 115, 22, 0.25);">🔴 ผลิตตามสั่ง (Pre-order)</div>`;

                grid.innerHTML += `
                    <div class="product-card" data-category="${prod.category}">
                        <div class="p-badge">${prod.badge || 'สั่งตัดตามพื้นที่'}</div>
                        <img src="${prod.image || 'assets/cat_furniture.png'}" class="p-image" alt="${prod.title}">
                        <div class="p-title">${prod.title}</div>
                        <div class="p-price">${prod.price}</div>
                        ${stockBadge}
                        <div class="p-sold">${prod.sold || 'ผลิต 7-14 วัน'}</div>
                        <button class="btn btn-sm btn-outline open-modal-btn card-quote-btn" data-service="${prod.category}" data-title="${prod.title}">ขอใบเสนอราคา</button>
                    </div>
                `;
            });
        };

        // Render from local cache immediately
        renderList(db);

        // Fetch from Google Sheet in background if configured
        const webhookUrl = localStorage.getItem('google_sheet_webhook_url');
        if (webhookUrl) {
            fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'getProducts'
                })
            })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success' && res.data && res.data.length > 0) {
                    localStorage.setItem('shop_products_db', JSON.stringify(res.data));
                    renderList(res.data);
                }
            })
            .catch(err => console.error('Error syncing products with Google Sheets:', err));
        }
    };
    renderProductsFrontend();

    // ==========================================
    // 1. Navbar Scroll Effect & Active States
    // ==========================================
    const header = document.getElementById('main-header');
    
    const handleScroll = () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once in case page loads scrolled

    // Smooth active navigation highlight
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.desktop-nav a');

    const highlightNavLink = () => {
        let scrollPosition = window.scrollY + 100; // Offset for header

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNavLink);

    // ==========================================
    // 2. Mobile Menu System
    // ==========================================
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNavMenu = document.querySelector('.mobile-nav-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-menu a');

    const toggleMobileMenu = () => {
        mobileNavToggle.classList.toggle('open');
        mobileNavMenu.classList.toggle('open');
        document.body.style.overflow = mobileNavMenu.classList.contains('open') ? 'hidden' : '';
    };

    mobileNavToggle.addEventListener('click', toggleMobileMenu);

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNavMenu.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });

    // ==========================================
    // 3. Portfolio Tab Filter System
    // ==========================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked tab
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                // Add fade animation
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    if (filterValue === 'all' || category === filterValue) {
                        item.classList.remove('hide');
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        item.classList.add('hide');
                    }
                }, 300);
            });
        });
    });

    // ==========================================
    // 4. Modal System (Consultation Form)
    // ==========================================
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.querySelector('.modal-close');
    const modalCloseAction = document.querySelector('.close-modal-action');
    const closeSuccessBtn = document.querySelector('.close-modal-success-btn');
    const projectTypeSelect = document.getElementById('project-type');
    const consultationForm = document.getElementById('consultation-form');
    const successState = document.getElementById('modal-success-state');
    const createdQuoteId = document.getElementById('created-quote-id');
    const fileInput = document.getElementById('client-file');
    const filePreview = document.querySelector('.file-name-preview');
    const filePlaceholder = document.querySelector('.file-upload-placeholder');

    const openModal = (serviceType = 'general', productTitle = '') => {
        // Set dropdown selection based on clicked button data
        if (projectTypeSelect) {
            projectTypeSelect.value = serviceType;
        }
        
        // Reset form & state
        consultationForm.reset();
        consultationForm.classList.remove('hide');
        successState.classList.add('hide');
        filePreview.classList.add('hide');
        filePlaceholder.classList.remove('hide');

        // Pre-fill detail if product title is provided
        const projectDetail = document.getElementById('project-detail');
        if (projectDetail) {
            if (productTitle) {
                projectDetail.value = `สนใจขอใบเสนอราคาสำหรับ: ${productTitle}\nรายละเอียดขนาดความต้องการ: `;
            } else {
                projectDetail.value = '';
            }
        }
        
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modalOverlay.classList.remove('open');
        if (!mobileNavMenu.classList.contains('open')) {
            document.body.style.overflow = '';
        }
    };

    // Attach open modal listener to ALL elements with .open-modal-btn
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.open-modal-btn');
        if (btn) {
            e.preventDefault();
            const service = btn.getAttribute('data-service') || 'general';
            const title = btn.getAttribute('data-title') || '';
            openModal(service, title);
        }
    });

    modalClose.addEventListener('click', closeModal);
    modalCloseAction.addEventListener('click', closeModal);
    closeSuccessBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside container
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // File Upload Preview
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            filePreview.textContent = `📄 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
            filePreview.classList.remove('hide');
            filePlaceholder.classList.add('hide');
        } else {
            filePreview.classList.add('hide');
            filePlaceholder.classList.remove('hide');
        }
    });

    // Handle Consultation Form Submit
    consultationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const clientName = document.getElementById('client-name').value.trim();
        const clientPhone = document.getElementById('client-phone').value.trim();
        const clientLine = document.getElementById('client-line').value.trim();
        const projectType = document.getElementById('project-type').value;
        const projectDetail = document.getElementById('project-detail').value.trim();

        let typeLabel = projectType;
        if (projectType === 'furniture') typeLabel = 'เฟอร์นิเจอร์สไตล์ลอฟท์ (โต๊ะ, เก้าอี้, ชั้นวาง)';
        else if (projectType === 'cnc') typeLabel = 'งาน CNC โลหะฉลุลายตกแต่ง';
        else if (projectType === 'architecture') typeLabel = 'งานสถาปัตยกรรม (ประตูเหล็กกระจก, กั้นห้อง)';
        else if (projectType === 'grille') typeLabel = 'เหล็กดัดพรีเมียม / เหล็กดัดดีไซน์โมเดิร์น';
        else if (projectType === 'general') typeLabel = 'อื่นๆ / ทั่วไป';

        const msg = encodeURIComponent(
            `📝 ส่งคำขอประเมินราคา / สอบถามสั่งผลิต\n` +
            `👤 ลูกค้า: ${clientName}\n` +
            `📞 เบอร์โทรศัพท์: ${clientPhone}\n` +
            `💬 Line ID: ${clientLine || '-'}\n` +
            `🏷️ ประเภทงาน: ${typeLabel}\n` +
            `✏️ รายละเอียดเพิ่มเติม: ${projectDetail || '-'}`
        );

        window.open(`https://lin.ee/8w8xm7u?text=${msg}`, '_blank');

        // Simulate sending to backend
        const submitBtn = consultationForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> กำลังส่งข้อมูล...';

        setTimeout(() => {
            // Generate a random 5-digit number
            const randomQuoteNum = Math.floor(10000 + Math.random() * 90000);
            createdQuoteId.textContent = `QU-${randomQuoteNum}`;
            
            // Hide Form, Show Success
            consultationForm.classList.add('hide');
            successState.classList.remove('hide');
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 1500);
    });

    // ==========================================
    // 5. Order Status Tracking System
    // ==========================================
    const trackingForm = document.getElementById('tracking-form');
    const quoteNumInput = document.getElementById('quote-number');
    const trackingResult = document.getElementById('tracking-result');
    const trackingError = document.getElementById('tracking-error');
    
    // Quick click on suggestion tags
    document.querySelectorAll('.tracking-tip strong').forEach(el => {
        el.addEventListener('click', () => {
            const rawCode = el.textContent.replace('QU-', '');
            quoteNumInput.value = rawCode;
            // Scroll to the form field and focus
            quoteNumInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            quoteNumInput.focus();
        });
    });

    // Custom Mock Database
    const orderDatabase = {
        '10245': {
            customer: 'คุณนรินทร์ชัย สมบูรณ์ทรัพย์',
            type: 'โต๊ะทำงาน Loft Wood + ชั้นวางเหล็กพิกเซล',
            step: 5, // Status: Completed 4, In progress 5
            dates: ['12 พ.ค. 2569', '15 พ.ค. 2569', '18 พ.ค. 2569', '25 พ.ค. 2569', '11 มิ.ย. 2569'],
            percent: '95%',
            desc: ['วัดระยะหน้างานเสร็จสิ้น', 'อนุมัติแบบ 3D และราคาเสร็จเรียบร้อย', 'ชำระค่ามัดจำงวดแรกเข้าระบบเรียบร้อย', 'ผลิตชิ้นงานประกอบเสร็จและ QC ผ่าน', 'ช่างกำลังเดินทางไปจัดส่งและติดตั้งที่หน้างานจริง วันนี้']
        },
        '88901': {
            customer: 'หจก. ลอฟท์ อาร์คิเทค',
            type: 'แผงผนังตกแต่ง CNC เหล็กฉลุลายเรขาคณิต (12 ตร.ม.)',
            step: 2, // Status: Completed 1, In progress 2
            dates: ['08 มิ.ย. 2569', '10 มิ.ย. 2569', 'รอดำเนินการ', 'รอดำเนินการ', 'รอดำเนินการ'],
            percent: '35%',
            desc: ['วัดพื้นที่โดยรอบเสร็จสิ้น', 'ทีมสถาปนิกกำลังเขียนแบบ 3D และสเปกราคาให้ลูกค้าตรวจสอบภายในพรุ่งนี้', 'รอชำระมัดจำหลังอนุมัติแบบ', 'รอการตัดวัสดุและขึ้นโครง', 'รอการติดตั้งหลังผลิตเสร็จ']
        },
        '55201': {
            customer: 'ร้านอาหาร The Glass House',
            type: 'ประตูบานเลื่อนเหล็กดำกระจกใส + พาร์ทิชันเหล็กช่องแสง',
            step: 4, // Status: Completed 3, In progress 4
            dates: ['25 พ.ค. 2569', '29 พ.ค. 2569', '02 มิ.ย. 2569', '07 มิ.ย. 2569', 'รอดำเนินการ'],
            percent: '75%',
            desc: ['วัดพื้นที่ช่องประตูเสร็จสิ้น', 'อนุมัติแบบโครงสร้างหน้างานเสร็จสิ้น', 'รับชำระเงินมัดจำก้อนแรกเรียบร้อย', 'เครื่องเลเซอร์ CNC กำลังประกอบกรอบเหล็กหน้างาน ณ โรงงาน', 'เตรียมนำโครงสร้างเข้าติดตั้งวันที่ 15 มิ.ย.']
        }
    };

    trackingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const trackingBtn = trackingForm.querySelector('.btn-track');
        const btnText = trackingBtn.querySelector('.btn-text');
        const spinner = trackingBtn.querySelector('.spinner');
        
        // Toggle loading state
        trackingBtn.disabled = true;
        btnText.textContent = 'กำลังตรวจสอบ...';
        spinner.classList.remove('hide');
        trackingResult.classList.add('hide');
        trackingError.classList.add('hide');

        const enteredCode = quoteNumInput.value.trim().toUpperCase().replace('QU-', '');

        setTimeout(() => {
            // Reset button
            trackingBtn.disabled = false;
            btnText.textContent = 'ตรวจสอบสถานะ';
            spinner.classList.add('hide');

            let order = orderDatabase[enteredCode];

            // If not found, create a realistic randomized mock for any other code
            if (!order) {
                if (/^[0-9A-Z]{4,8}$/.test(enteredCode)) {
                    // Let's create a realistic randomized progress
                    const randomStep = Math.floor(Math.random() * 5) + 1; // Step 1 to 5
                    const percentMap = ['15%', '40%', '55%', '80%', '100%'];
                    order = {
                        customer: 'ลูกค้าทั่วไป (สั่งทำพิเศษ)',
                        type: 'โครงสร้างเหล็กผสมงานไม้ Made-to-Order',
                        step: randomStep,
                        dates: [
                            '01 มิ.ย. 2569',
                            randomStep >= 2 ? '03 มิ.ย. 2569' : 'รอดำเนินการ',
                            randomStep >= 3 ? '05 มิ.ย. 2569' : 'รอดำเนินการ',
                            randomStep >= 4 ? '09 มิ.ย. 2569' : 'รอดำเนินการ',
                            randomStep >= 5 ? '12 มิ.ย. 2569' : 'รอดำเนินการ'
                        ],
                        percent: percentMap[randomStep - 1],
                        desc: [
                            'วัดระยะหน้างานเสร็จสิ้น',
                            'จัดทำแบบและประเมินราคาเรียบร้อย',
                            'ชำระมัดจำเปิดสั่งผลิตวัสดุแล้ว',
                            'อยู่ระหว่างกระบวนการขัดผิวเหล็กและผลิตในโรงงาน',
                            'สินค้าจัดเตรียมรอส่งมอบหรือส่งช่างติดตั้งเสร็จสิ้น'
                        ]
                    };
                } else {
                    // Invalid format
                    trackingError.textContent = `❌ ไม่พบข้อมูลใบเสนอราคา "QU-${enteredCode}" โปรดตรวจสอบรหัสที่ถูกต้อง หรือติดต่อร้านค้า`;
                    trackingError.classList.remove('hide');
                    return;
                }
            }

            // Populate Results UI
            document.getElementById('res-quote-id').textContent = `QU-${enteredCode}`;
            document.getElementById('res-customer-name').textContent = order.customer;
            document.getElementById('res-order-type').textContent = order.type;
            document.getElementById('progress-percent').textContent = order.percent;

            // Update Timeline Steps
            const timelineSteps = document.querySelectorAll('.timeline-step');
            const stepDescs = [
                'วัดขนาดหน้างานเสร็จสิ้นและยืนยันระยะวัดจริง',
                'ส่งมอบและอนุมัติแบบร่างโมเดล 3D',
                'ชำระมัดจำงวดแรก เข้าสู่ระบบวางแผนการผลิต',
                'เริ่มจัดเตรียมวัสดุและเดินเครื่องผลิตโครงสร้างเหล็ก/ไม้',
                'ขนย้ายงานเข้าติดตั้งและประกอบหน้างานจริง'
            ];

            timelineSteps.forEach((element, index) => {
                const currentStepNum = index + 1;
                element.classList.remove('active', 'completed');
                
                // Date
                const dateEl = element.querySelector('.step-date');
                dateEl.textContent = order.dates[index];

                // Description overrides
                const descEl = element.querySelector('.step-desc');
                descEl.textContent = order.desc[index];

                if (currentStepNum < order.step) {
                    element.classList.add('completed');
                } else if (currentStepNum === order.step) {
                    if (order.percent === '100%') {
                        element.classList.add('completed');
                    } else {
                        element.classList.add('active');
                    }
                }
            });

            // Set progress bar width
            const progressFill = document.getElementById('progress-fill');
            progressFill.style.width = '0%';
            
            // Show result block with simple slide down
            trackingResult.classList.remove('hide');
            
            // Animation tick
            setTimeout(() => {
                progressFill.style.width = order.percent;
            }, 100);

            // Smooth scroll to results
            trackingResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        }, 1200);
    });

    // ==========================================
    // 6. Member System JS Logic
    // ==========================================
    const loginModalOverlay = document.getElementById('login-modal-overlay');
    const loginModalClose = document.getElementById('login-modal-close');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTabBtns = document.querySelectorAll('.login-tab-btn');
    
    const profileModalOverlay = document.getElementById('profile-modal-overlay');
    const profileModalClose = document.getElementById('profile-modal-close');
    const btnCloseProfile = document.getElementById('btn-close-profile');
    
    const headerLoginBtn = document.getElementById('header-login-btn');
    const headerUserMenu = document.getElementById('header-user-menu');
    const headerUserAvatar = document.getElementById('header-user-avatar');
    const headerUserName = document.getElementById('header-user-name');
    
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const mobileLoginWrapper = document.getElementById('mobile-login-wrapper');
    const mobileUserWrapper = document.getElementById('mobile-user-wrapper');
    const mobileUserAvatar = document.getElementById('mobile-user-avatar');
    const mobileUserName = document.getElementById('mobile-user-name');
    
    const btnLogout = document.getElementById('btn-logout');
    const btnMyOrders = document.getElementById('btn-my-orders');
    const btnViewProfile = document.getElementById('btn-view-profile');
    
    const mobileBtnLogout = document.getElementById('mobile-btn-logout');
    const mobileBtnOrders = document.getElementById('mobile-btn-orders');
    const mobileBtnProfile = document.getElementById('mobile-btn-profile');

    // Default Logged User State
    let currentUser = null;

    const openLoginModal = (tab = 'login-tab') => {
        // Toggle Active Tab
        loginTabBtns.forEach(btn => {
            if (btn.getAttribute('data-tab') === tab) {
                btn.classList.add('active');
                btn.style.borderColor = 'var(--accent-orange)';
                btn.style.color = 'var(--text-light)';
            } else {
                btn.classList.remove('active');
                btn.style.borderColor = 'transparent';
                btn.style.color = 'var(--text-muted)';
            }
        });

        if (tab === 'login-tab') {
            loginForm.classList.remove('hide');
            registerForm.classList.add('hide');
        } else {
            loginForm.classList.add('hide');
            registerForm.classList.remove('hide');
        }

        loginModalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeLoginModal = () => {
        loginModalOverlay.classList.remove('open');
        if (!mobileNavMenu.classList.contains('open')) {
            document.body.style.overflow = '';
        }
    };

    // Tab Switch Event
    loginTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            openLoginModal(tabName);
        });
    });

    // Login Form Submit (Simulate)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> กำลังเข้าสู่ระบบ...';

        setTimeout(() => {
            // Mock Login Success
            const emailVal = document.getElementById('login-email').value;
            const mockName = emailVal.includes('@') ? emailVal.split('@')[0] : 'สมศักดิ์ รักดี';
            
            loginUser({
                name: mockName.charAt(0).toUpperCase() + mockName.slice(1),
                email: emailVal.includes('@') ? emailVal : 'somsak@ironservicekk.com',
                phone: '063-7409696'
            });

            submitBtn.disabled = false;
            submitBtn.textContent = 'เข้าสู่ระบบ';
            closeLoginModal();
        }, 1200);
    });

    // Register Form Submit (Simulate)
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> กำลังสมัครสมาชิก...';

        setTimeout(() => {
            const nameVal = document.getElementById('reg-name').value;
            const phoneVal = document.getElementById('reg-phone').value;
            const emailVal = document.getElementById('reg-email').value;

            loginUser({
                name: nameVal,
                email: emailVal,
                phone: phoneVal
            });

            submitBtn.disabled = false;
            submitBtn.textContent = 'ยืนยันสมัครสมาชิก';
            closeLoginModal();
        }, 1500);
    });

    // Social Login Click (Instant)
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            let provider = 'Google';
            if (btn.classList.contains('line-login')) {
                provider = 'LINE';
            } else if (btn.classList.contains('facebook-login')) {
                provider = 'Facebook';
            }
            btn.innerHTML = '<span class="spinner"></span> เชื่อมต่อ...';
            setTimeout(() => {
                loginUser({
                    name: `คุณลูกค้า (${provider})`,
                    email: `customer.${provider.toLowerCase()}@ironservicekk.com`,
                    phone: '063-7409696'
                });
                btn.textContent = provider;
                closeLoginModal();
            }, 800);
        });
    });

    const loginUser = (user) => {
        currentUser = user;
        const initial = user.name.charAt(0).toUpperCase();

        // Update Desktop Navbar UI
        headerLoginBtn.classList.add('hide');
        headerUserMenu.classList.remove('hide');
        headerUserAvatar.textContent = initial;
        headerUserName.textContent = user.name;

        // Update Mobile Drawer UI
        mobileLoginWrapper.classList.add('hide');
        mobileUserWrapper.classList.remove('hide');
        mobileUserAvatar.textContent = initial;
        mobileUserName.textContent = user.name;

        // Update Profile Modal Details
        document.getElementById('prof-name').textContent = user.name;
        document.getElementById('prof-email').textContent = user.email;
        document.getElementById('prof-phone').textContent = user.phone;
        document.getElementById('prof-avatar-placeholder').textContent = initial;
    };

    const logoutUser = () => {
        currentUser = null;

        // Restore Desktop UI
        headerLoginBtn.classList.remove('hide');
        headerUserMenu.classList.add('hide');

        // Restore Mobile UI
        mobileLoginWrapper.classList.remove('hide');
        mobileUserWrapper.classList.add('hide');
    };

    // View Profile Modal
    const openProfileModal = () => {
        profileModalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeProfileModal = () => {
        profileModalOverlay.classList.remove('open');
        if (!mobileNavMenu.classList.contains('open')) {
            document.body.style.overflow = '';
        }
    };

    // Event Listeners
    headerLoginBtn.addEventListener('click', () => openLoginModal('login-tab'));
    mobileLoginBtn.addEventListener('click', () => {
        toggleMobileMenu();
        openLoginModal('login-tab');
    });

    loginModalClose.addEventListener('click', closeLoginModal);
    loginModalOverlay.addEventListener('click', (e) => {
        if (e.target === loginModalOverlay) closeLoginModal();
    });

    profileModalClose.addEventListener('click', closeProfileModal);
    btnCloseProfile.addEventListener('click', closeProfileModal);
    profileModalOverlay.addEventListener('click', (e) => {
        if (e.target === profileModalOverlay) closeProfileModal();
    });

    // Profile Dropdown Actions
    btnViewProfile.addEventListener('click', (e) => {
        e.preventDefault();
        openProfileModal();
    });
    mobileBtnProfile.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMobileMenu();
        openProfileModal();
    });

    // Logout Events
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
    });
    mobileBtnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMobileMenu();
        logoutUser();
    });

    // Integrate with Tracking: Show User Orders
    const triggerTrackOrder = (quoteId) => {
        quoteNumInput.value = quoteId;
        
        // Hide modals & menus
        closeProfileModal();
        
        // Trigger submit
        const event = new Event('submit');
        trackingForm.dispatchEvent(event);
    };

    btnMyOrders.addEventListener('click', (e) => {
        e.preventDefault();
        triggerTrackOrder('10245');
    });
    mobileBtnOrders.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMobileMenu();
        triggerTrackOrder('10245');
    });

    // Click order inside Profile Modal
    document.querySelectorAll('.profile-order-card').forEach(card => {
        card.addEventListener('click', () => {
            const quoteId = card.getAttribute('data-quote');
            triggerTrackOrder(quoteId);
        });
    });

    // ==========================================
    // 7. Shopee Product Importer Sandbox
    // ==========================================
    const shopeeImportForm = document.getElementById('shopee-import-form');
    const shopeeUrlInput = document.getElementById('shopee-url');
    const importerLogs = document.getElementById('importer-logs');
    const catalogGrid = document.querySelector('.catalog-grid');

    if (shopeeImportForm) {
        shopeeImportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = shopeeImportForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Disable button, show logs
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> กำลังดึงข้อมูล...';
            importerLogs.classList.remove('hide');
            importerLogs.innerHTML = '';

            const url = shopeeUrlInput.value.trim();
            const regex = /product\/(\d+)\/(\d+)/;
            const match = url.match(regex);
            
            let shopId = '77897542';
            let itemId = '40408706087';
            if (match) {
                shopId = match[1];
                itemId = match[2];
            }

            const isTargetProduct = (itemId === '40408706087');

            const timestamp = () => {
                const now = new Date();
                return `[${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}]`;
            };

            const addLog = (text, delay) => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const line = document.createElement('div');
                        line.className = 'log-line';
                        line.textContent = `${timestamp()} ${text}`;
                        importerLogs.appendChild(line);
                        importerLogs.scrollTop = importerLogs.scrollHeight;
                        resolve();
                    }, delay);
                });
            };

            // Run log timeline sequence simulating a real Shopee API crawler sync
            if (isTargetProduct) {
                addLog('🔄 เริ่มต้นโปรเซสการอ่าน URL ผลิตภัณฑ์...', 0)
                    .then(() => addLog(`🔗 ตรวจพบลิงก์สินค้า Shopee: ${url}`, 600))
                    .then(() => addLog(`📌 ถอดรหัสตำแหน่งร้านสำเร็จ -> Shop ID: ${shopId} | Item ID: ${itemId}`, 500))
                    .then(() => addLog('📡 กำลังสร้างคำขอแบบ Secure Request ไปยัง Shopee API Gateway...', 800))
                    .then(() => addLog('🛡️ ตรวจพบ Cloudflare Bot Protection - กำลังเปิดใช้ Proxy Bypass...', 1000))
                    .then(() => addLog('🔓 Bypass สำเร็จ! กำลังประมวลผลข้อมูล JSON (Response: 200 OK)...', 800))
                    .then(() => addLog('📦 ได้รับข้อมูลสินค้า: "IRONSERVICE : ชั้นวางต้นไม้แบบขั้นบันได 3 ชั้น \"โครงเหล็กกันสนิม\" ไม้แท้เคลือบเงาใส"', 600))
                    .then(() => addLog('💰 ราคาจำหน่าย: 2,590 บาท | ตัวเลือกสินค้า: สีดำไม้โอ๊ค, สีขาวไม้ใส', 400))
                    .then(() => addLog('🖼️ ดึงข้อมูลรูปภาพหลักสำเร็จ (assets/shopee_plant_shelf.jpg)...', 600))
                    .then(() => addLog('✅ การดึงข้อมูลและซิงโครไนซ์เสร็จสิ้น! ทำการเพิ่มสินค้าลงในแคตตาล็อก...', 500))
                    .then(() => {
                        // Reset Button
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;

                        // Dynamically build and append the new card
                        const newCard = document.createElement('div');
                        newCard.className = 'catalog-card';
                        newCard.style.borderColor = 'var(--accent-orange)';
                        newCard.style.boxShadow = '0 8px 25px rgba(249, 115, 22, 0.15)';
                        newCard.style.animation = 'fadeInUp 0.8s ease-out';
                        
                        newCard.innerHTML = `
                            <div class="card-img-wrapper">
                                <img class="product-cover-img" src="assets/shopee_plant_shelf.jpg" alt="IRONSERVICE : ชั้นวางต้นไม้แบบขั้นบันได 3 ชั้น โครงเหล็กกันสนิม ไม้แท้เคลือบเงาใส">
                                <div class="card-overlay"></div>
                                <div style="position: absolute; top: 12px; left: 12px; background-color: #f97316; color: white; padding: 0.25rem 0.55rem; font-size: 0.7rem; font-weight: 700; border-radius: 4px; z-index: 3; box-shadow: 0 2px 6px rgba(0,0,0,0.3); letter-spacing: 0.05em;">SHOPEE SYNCED</div>
                            </div>
                            <div class="card-content">
                                <h3 style="font-size: 1.1rem; color: var(--text-light); margin-bottom: 0.5rem; line-height: 1.4;">
                                    IRONSERVICE : ชั้นวางต้นไม้แบบขั้นบันได 3 ชั้น "โครงเหล็กกันสนิม"
                                </h3>
                                <p style="font-size: 0.8rem; margin-bottom: 1rem; color: var(--text-muted); line-height: 1.5;">
                                    กว้าง 75 ซม. ยาว 120 ซม. สูง 100 ซม. โครงเหล็กกัลวาไนซ์กันสนิมขนาด 1x1 นิ้ว พ่นสีอุตสาหกรรม ท็อปไม้แท้ประสานหนาพิเศษ เคลือบเงาใสกันน้ำคุณภาพสูง (ดึงข้อมูลจาก Shopee จริง)
                                </p>
                                
                                <div class="product-options-selector" style="margin-bottom: 1.25rem;">
                                    <label style="display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">เลือกสีโครงเหล็ก & ไม้:</label>
                                    <div style="display: flex; gap: 0.5rem;">
                                        <button class="option-btn active" data-option="black" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; background: rgba(249, 115, 22, 0.1); border: 1px solid var(--accent-orange); border-radius: 4px; color: var(--text-light); cursor: pointer; font-weight: 600; transition: all 0.2s;">
                                            ⚫ สีดำไม้โอ๊ค
                                        </button>
                                        <button class="option-btn" data-option="white" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-muted); cursor: pointer; transition: all 0.2s;">
                                            ⚪ สีขาวไม้ใส
                                        </button>
                                    </div>
                                </div>

                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.75rem; border-top: 1px dashed var(--border-color);">
                                    <div style="display: flex; flex-direction: column;">
                                        <span style="font-size: 0.75rem; text-decoration: line-through; color: var(--text-muted); margin-bottom: -2px;">฿3,000</span>
                                        <span style="font-weight: 800; color: var(--accent-gold); font-size: 1.35rem; font-family: var(--font-heading);">฿2,590</span>
                                    </div>
                                    <a href="${url}" target="_blank" class="btn btn-sm btn-primary" style="background-color: #f97316; border: none; text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem; box-shadow: 0 2px 8px rgba(249,115,22,0.2); font-weight: 600; padding: 0.5rem 0.8rem;">
                                        <svg viewBox="0 0 24 24" width="14" height="14" style="margin-bottom:-1px;"><path fill="currentColor" d="M17,18A2,2 0 0,1 19,20A2,2 0 0,1 17,22C15.89,22 15,21.1 15,20C15,18.89 15.89,18 17,18M1,2H4.27L5.21,4H20A1,1 0 0,1 21,5C21,5.17 20.95,5.34 20.88,5.5L17.3,12C16.94,12.62 16.27,13 15.55,13H8.1L7.2,14.63L7.17,14.75A0.25,0.25 0 0,0 7.42,15H19V17H7C5.89,17 5,16.1 5,15C5,14.42 5.25,13.91 5.66,13.55L7.06,11L3,3H1V2M7,18A2,2 0 0,1 9,20A2,2 0 0,1 7,22C5.89,22 5,21.1 5,20C5,18.89 5.89,18 7,18Z"/></svg>
                                        ซื้อบน Shopee
                                    </a>
                                </div>
                            </div>
                        `;

                        // Add event listener to option buttons
                        const optBtns = newCard.querySelectorAll('.option-btn');
                        optBtns.forEach(btn => {
                            btn.addEventListener('click', () => {
                                optBtns.forEach(b => {
                                    b.classList.remove('active');
                                    b.style.background = 'var(--bg-primary)';
                                    b.style.borderColor = 'var(--border-color)';
                                    b.style.color = 'var(--text-muted)';
                                    b.style.fontWeight = 'normal';
                                });
                                btn.classList.add('active');
                                btn.style.background = 'rgba(249, 115, 22, 0.1)';
                                btn.style.borderColor = 'var(--accent-orange)';
                                btn.style.color = 'var(--text-light)';
                                btn.style.fontWeight = '600';
                                
                                const logLine = document.createElement('div');
                                logLine.className = 'log-line';
                                logLine.style.color = '#f97316';
                                logLine.textContent = `${timestamp()} [ตัวเลือก] เลือกสเปก: ${btn.textContent.trim()}`;
                                importerLogs.appendChild(logLine);
                                importerLogs.scrollTop = importerLogs.scrollHeight;
                            });
                        });

                        // Append card
                        catalogGrid.appendChild(newCard);
                        
                        // Scroll card into view
                        newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    });
            } else {
                addLog('🔄 เริ่มต้นโปรเซสการอ่าน URL ผลิตภัณฑ์...', 0)
                    .then(() => addLog(`🔗 ตรวจพบลิงก์สินค้า Shopee: ${url}`, 600))
                    .then(() => addLog(`📌 ถอดรหัสตำแหน่งร้านสำเร็จ -> Shop ID: ${shopId} | Item ID: ${itemId}`, 500))
                    .then(() => addLog('📡 กำลังสร้างคำขอแบบ Secure Request ไปยัง Shopee API Gateway...', 800))
                    .then(() => addLog('🛡️ ตรวจพบ Cloudflare Bot Protection - กำลังเปิดใช้ Proxy Bypass...', 1000))
                    .then(() => addLog('🔓 Bypass สำเร็จ! กำลังประมวลผลข้อมูล JSON (Response: 200 OK)...', 800))
                    .then(() => addLog('📦 ได้รับข้อมูลสินค้า: "โต๊ะทำงานโครงเหล็ก ท็อปไม้ลอฟท์พรีเมียม LOFT & CRAFT"', 600))
                    .then(() => addLog('💰 ราคาจำหน่าย: 3,850 บาท | ลิงก์ร้านค้าต้นฉบับผูกเสร็จสิ้น', 400))
                    .then(() => addLog('🖼️ ดึงข้อมูลรูปภาพหลักสำเร็จ และย่อภาพเก็บไว้ที่แคชของเบราว์เซอร์...', 600))
                    .then(() => addLog('✅ การดึงข้อมูลและซิงโครไนซ์เสร็จสิ้น! ทำการเพิ่มสินค้าลงในแคตตาล็อก...', 500))
                    .then(() => {
                        // Reset Button
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;

                        // Dynamically build and append the new card
                        const newCard = document.createElement('div');
                        newCard.className = 'catalog-card';
                        newCard.style.borderColor = 'var(--accent-orange)';
                        newCard.style.boxShadow = '0 8px 25px rgba(249, 115, 22, 0.15)';
                        newCard.style.animation = 'fadeInUp 0.8s ease-out';
                        
                        newCard.innerHTML = `
                            <div class="card-img-wrapper">
                                <img src="assets/cat_furniture.png" alt="โต๊ะทำงานโครงเหล็ก ท็อปไม้ลอฟท์พรีเมียม LOFT & CRAFT">
                                <div class="card-overlay"></div>
                                <div style="position: absolute; top: 12px; left: 12px; background-color: #f97316; color: white; padding: 0.25rem 0.55rem; font-size: 0.7rem; font-weight: 700; border-radius: 4px; z-index: 3; box-shadow: 0 2px 6px rgba(0,0,0,0.3); letter-spacing: 0.05em;">SHOPEE SYNCED</div>
                            </div>
                            <div class="card-content">
                                <h3 style="font-size: 1.2rem; color: var(--text-light); margin-bottom: 0.5rem;">โต๊ะทำงานสไตล์ลอฟท์พรีเมียม</h3>
                                <p style="font-size: 0.85rem; margin-bottom: 1.5rem;">โต๊ะทำงานโครงเหล็กกล่องพ่นสีดำ ท็อปไม้จริงสไตล์อินดัสเทรียลลอฟท์ ทนทาน แข็งแรงพิเศษ (ซิงก์ดึงข้อมูลจาก Shopee อัตโนมัติ)</p>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.5rem; border-top: 1px dashed var(--border-color);">
                                    <span style="font-weight: 800; color: var(--accent-gold); font-size: 1.25rem; font-family: var(--font-heading);">฿3,850</span>
                                    <a href="${url}" target="_blank" class="btn btn-sm btn-primary" style="background-color: #f97316; border: none; text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem; box-shadow: 0 2px 8px rgba(249,115,22,0.2);">
                                        <svg viewBox="0 0 24 24" width="14" height="14" style="margin-bottom:-1px;"><path fill="currentColor" d="M17,18A2,2 0 0,1 19,20A2,2 0 0,1 17,22C15.89,22 15,21.1 15,20C15,18.89 15.89,18 17,18M1,2H4.27L5.21,4H20A1,1 0 0,1 21,5C21,5.17 20.95,5.34 20.88,5.5L17.3,12C16.94,12.62 16.27,13 15.55,13H8.1L7.2,14.63L7.17,14.75A0.25,0.25 0 0,0 7.42,15H19V17H7C5.89,17 5,16.1 5,15C5,14.42 5.25,13.91 5.66,13.55L7.06,11L3,3H1V2M7,18A2,2 0 0,1 9,20A2,2 0 0,1 7,22C5.89,22 5,21.1 5,20C5,18.89 5.89,18 7,18Z"/></svg>
                                        ซื้อบน Shopee
                                    </a>
                                </div>
                            </div>
                        `;

                        // Append card
                        catalogGrid.appendChild(newCard);
                        
                        // Scroll card into view
                        newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    });
            }
        });
    }


    // ==========================================
    // 7. Search & Catalog Filter System (Enhanced)
    // ==========================================
    const searchInput = document.getElementById('global-search-input');
    const searchBtn = document.getElementById('global-search-btn');
    const searchSuggestions = document.getElementById('search-suggestions');
    const productCards = document.querySelectorAll('.product-card');

    // Full product database for suggestions
    const PRODUCT_DATABASE = [
        { icon: '🪑', label: 'โต๊ะกินข้าวไม้เนื้อแข็ง ขาเหล็กลอฟท์',     category: 'เฟอร์นิเจอร์', keywords: ['โต๊ะ','กินข้าว','ไม้','เหล็ก','ลอฟท์'] },
        { icon: '🪑', label: 'ชุดโต๊ะทำงานลอฟท์พร้อมขาเหล็กกล่อง',          category: 'ชุดโต๊ะ',     keywords: ['โต๊ะทำงาน','ออฟฟิศ','ไม้','เหล็ก'] },
        { icon: '🔩', label: 'เก้าอี้เหล็กดัดสไตล์อินดัสเทรียล',            category: 'เฟอร์นิเจอร์', keywords: ['เก้าอี้','เหล็ก','อินดัสเทรียล'] },
        { icon: '🔩', label: 'ม้านั่งเหล็กไม้สไตล์ลอฟท์',                  category: 'เฟอร์นิเจอร์', keywords: ['ม้านั่ง','เหล็ก','ไม้','ลอฟท์'] },
        { icon: '⚙️', label: 'แผ่นเหล็กฉลุลาย CNC ตกแต่งผนัง',             category: 'CNC',          keywords: ['cnc','ฉลุ','ลาย','เหล็ก','ผนัง'] },
        { icon: '⚙️', label: 'แผงกั้นห้อง CNC ลายเรขาคณิต',                category: 'CNC',          keywords: ['cnc','พาร์ทิชัน','กั้นห้อง','ลาย'] },
        { icon: '🚪', label: 'ประตูบานเลื่อนเหล็กกระจกใส',                  category: 'สถาปัตย์',     keywords: ['ประตู','กระจก','เหล็ก','บานเลื่อน'] },
        { icon: '🚪', label: 'ประตูรั้วเหล็กดัดดีไซน์พรีเมียม',             category: 'สถาปัตย์',     keywords: ['ประตู','รั้ว','เหล็กดัด'] },
        { icon: '🛎️', label: 'เคาน์เตอร์บาร์ไม้ลอฟท์ โครงเหล็ก',          category: 'เคาน์เตอร์',   keywords: ['เคาน์เตอร์','บาร์','ไม้','ลอฟท์'] },
        { icon: '🗄️', label: 'ตู้เก็บของเหล็กสไตล์อินดัสเทรียล',          category: 'ตู้/ชั้นวาง', keywords: ['ตู้','เหล็ก','อินดัสเทรียล'] },
        { icon: '🪜', label: 'ชั้นวางของเหล็กตะแกรงฉีก 5 ชั้น',            category: 'ตู้/ชั้นวาง', keywords: ['ชั้นวาง','เหล็ก','ตะแกรง'] },
        { icon: '🛏️', label: 'โครงเตียงเหล็กสไตล์ลอฟท์ 6 ฟุต',           category: 'เฟอร์นิเจอร์', keywords: ['เตียง','เหล็ก','ลอฟท์','6ฟุต'] },
        { icon: '📐', label: 'สั่งผลิตตามแบบ-ตามขนาด-ทุกรูปแบบ',            category: 'สั่งพิเศษ',   keywords: ['สั่ง','ผลิต','ออกแบบ','แบบ','3d'] },
        { icon: '🔨', label: 'งานเชื่อมเหล็กทุกประเภท',                     category: 'บริการ',       keywords: ['เชื่อม','เหล็ก','งานช่าง'] },
    ];

    const highlightText = (text, query) => {
        if (!query) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    };

    const showSuggestions = (query) => {
        if (!searchSuggestions) return;
        const q = query.toLowerCase().trim();
        if (!q || q.length < 1) {
            searchSuggestions.classList.remove('active');
            searchSuggestions.innerHTML = '';
            return;
        }
        const matches = PRODUCT_DATABASE.filter(item =>
            item.keywords.some(kw => kw.includes(q)) ||
            item.label.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        ).slice(0, 6);

        if (matches.length === 0) {
            searchSuggestions.innerHTML = `<div class="suggestions-no-result">ไม่พบ "${query}" ลองใช้คำอื่น เช่น โต๊ะ, CNC, ประตู</div>`;
        } else {
            searchSuggestions.innerHTML = matches.map(item => `
                <div class="suggestion-item" data-keyword="${item.keywords[0]}">
                    <span class="suggest-icon">${item.icon}</span>
                    <span class="suggest-label">${highlightText(item.label, q)}</span>
                    <span class="suggest-category">${item.category}</span>
                </div>
            `).join('');
            // Bind clicks
            searchSuggestions.querySelectorAll('.suggestion-item').forEach(el => {
                el.addEventListener('click', () => {
                    const kw = el.querySelector('.suggest-label').textContent;
                    if (searchInput) searchInput.value = kw;
                    searchSuggestions.classList.remove('active');
                    filterProducts(kw);
                    scrollToCatalog();
                });
            });
        }
        searchSuggestions.classList.add('active');
    };

    const filterProducts = (query = '') => {
        const lowerQuery = query.toLowerCase().trim();
        let found = 0;
        productCards.forEach(card => {
            const title = card.querySelector('.p-title') ? card.querySelector('.p-title').textContent.toLowerCase() : '';
            const category = (card.getAttribute('data-category') || '').toLowerCase();
            const badge = card.querySelector('.p-badge') ? card.querySelector('.p-badge').textContent.toLowerCase() : '';
            const visible = !lowerQuery || title.includes(lowerQuery) || category.includes(lowerQuery) || badge.includes(lowerQuery);
            card.style.display = visible ? 'flex' : 'none';
            card.style.opacity = '1';
            if (visible) found++;
        });
        return found;
    };

    const scrollToCatalog = () => {
        const catalogSec = document.getElementById('catalog');
        if (catalogSec) catalogSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (searchBtn && searchInput) {
        // Live search as typing
        searchInput.addEventListener('input', () => {
            filterProducts(searchInput.value);
            showSuggestions(searchInput.value);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                searchSuggestions && searchSuggestions.classList.remove('active');
                filterProducts(searchInput.value);
                scrollToCatalog();
            }
            if (e.key === 'Escape') {
                searchSuggestions && searchSuggestions.classList.remove('active');
            }
        });

        searchBtn.addEventListener('click', () => {
            searchSuggestions && searchSuggestions.classList.remove('active');
            filterProducts(searchInput.value);
            scrollToCatalog();
        });
    }

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
        if (searchSuggestions && !e.target.closest('#search-box-container')) {
            searchSuggestions.classList.remove('active');
        }
    });

    // Search Tags Click (strip emoji for filtering)
    document.querySelectorAll('.search-tag-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tagText = link.textContent.replace(/^[^\u0E00-\u0E7FA-Za-z]+/, '').trim();
            if (searchInput) searchInput.value = tagText;
            filterProducts(tagText);
            scrollToCatalog();
        });
    });

    // Quick Icon Menu filtering
    document.querySelectorAll('.quick-icons .icon-item').forEach(item => {
        item.addEventListener('click', () => {
            const service = item.getAttribute('data-service');
            if (service) {
                if (searchInput) searchInput.value = '';
                filterProducts(service);
                scrollToCatalog();
            }
        });
    });

    // ==========================================
    // 8. IMAGE SEARCH SYSTEM
    // ==========================================
    const imgSearchBtn    = document.getElementById('image-search-btn');
    const imgSearchModal  = document.getElementById('image-search-modal');
    const imgSearchClose  = document.getElementById('img-search-close');
    const imgFileInput    = document.getElementById('image-search-input');
    const imgDropZone     = document.getElementById('img-drop-zone');
    const imgAnalysisState = document.getElementById('img-analysis-state');
    const imgPreview      = document.getElementById('img-preview');
    const imgAnalysisTags = document.getElementById('img-analysis-tags');
    const analysisText    = document.getElementById('analysis-text');
    const imgSearchResults = document.getElementById('img-search-results');
    const imgResultsGrid   = document.getElementById('img-results-grid');
    const imgResultsTitle  = document.getElementById('img-results-title');
    const imgSearchAgain   = document.getElementById('img-search-again');

    // Product catalog for image matching
    const IMAGE_PRODUCTS = [
        { img: 'assets/cat_furniture.png', title: 'โต๊ะกินข้าวไม้เนื้อแข็ง ขาเหล็ก X-Shape', price: 'เริ่ม ฿8,500', category: 'furniture', match: 95 },
        { img: 'assets/cat_cnc.png',       title: 'แผ่นเหล็กฉลุลาย CNC แผงกั้นห้อง',        price: '฿1,500/ตร.ม.',  category: 'cnc',       match: 88 },
        { img: 'assets/cat_glass_door.png',title: 'ประตูบานเลื่อนเหล็กกระจกใส',             price: 'ประเมินตามขนาด',category: 'glass',     match: 82 },
        { img: 'assets/cat_grille.png',    title: 'โครงเตียงเหล็กสไตล์ลอฟท์ 6 ฟุต',        price: 'เริ่ม ฿11,000', category: 'grille',    match: 76 },
        { img: 'assets/hero_background.png',title: 'ชั้นวางของเหล็กตะแกรงฉีก 5 ชั้น',       price: 'เริ่ม ฿4,200',  category: 'furniture', match: 70 },
    ];

    // Open modal
    const openImgModal = () => {
        if (!imgSearchModal) return;
        imgSearchModal.classList.add('active');
        imgSearchModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        resetImgSearch();
    };

    const closeImgModal = () => {
        if (!imgSearchModal) return;
        imgSearchModal.classList.remove('active');
        imgSearchModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    const resetImgSearch = () => {
        if (imgDropZone) imgDropZone.classList.remove('hide');
        if (imgAnalysisState) imgAnalysisState.classList.add('hide');
        if (imgSearchResults) imgSearchResults.classList.add('hide');
        if (imgFileInput) imgFileInput.value = '';
    };

    if (imgSearchBtn) imgSearchBtn.addEventListener('click', (e) => { e.preventDefault(); openImgModal(); });
    if (imgSearchClose) imgSearchClose.addEventListener('click', closeImgModal);
    if (imgSearchModal) imgSearchModal.addEventListener('click', (e) => { if (e.target === imgSearchModal) closeImgModal(); });
    if (imgSearchAgain) imgSearchAgain.addEventListener('click', resetImgSearch);

    // Close on Escape
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeImgModal(); });

    // Drag & Drop
    if (imgDropZone) {
        imgDropZone.addEventListener('dragover', (e) => { e.preventDefault(); imgDropZone.classList.add('drag-over'); });
        imgDropZone.addEventListener('dragleave', () => imgDropZone.classList.remove('drag-over'));
        imgDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            imgDropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) processImageFile(file);
        });
    }

    // File input change
    if (imgFileInput) {
        imgFileInput.addEventListener('change', () => {
            const file = imgFileInput.files[0];
            if (file) processImageFile(file);
        });
    }

    // Analyze dominant color of image using canvas
    const analyzeImageColors = (imgEl) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(imgEl, 0, 0, 50, 50);
        const data = ctx.getImageData(0, 0, 50, 50).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
            r += data[i]; g += data[i+1]; b += data[i+2]; count++;
        }
        r = Math.round(r/count); g = Math.round(g/count); b = Math.round(b/count);
        // Classify by color
        const isWarm    = r > 140 && r > g * 1.2;  // Brown/wood tones
        const isDark    = (r+g+b)/3 < 80;            // Very dark metallic
        const isGray    = Math.abs(r-g)<25 && Math.abs(g-b)<25; // Gray/metal
        const isLight   = (r+g+b)/3 > 160;           // Light/glass
        return { r, g, b, isWarm, isDark, isGray, isLight };
    };

    const processImageFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Show preview
            if (imgPreview) imgPreview.src = e.target.result;
            if (imgDropZone) imgDropZone.classList.add('hide');
            if (imgAnalysisState) imgAnalysisState.classList.remove('hide');
            if (imgSearchResults) imgSearchResults.classList.add('hide');

            // Analyze after image loads
            const tempImg = new Image();
            tempImg.onload = () => {
                const colors = analyzeImageColors(tempImg);
                runAnalysisAnimation(colors);
            };
            tempImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    const runAnalysisAnimation = (colors) => {
        // Step 1: Analyzing
        if (analysisText) analysisText.textContent = 'กำลังวิเคราะห์รูปภาพ...';
        if (imgAnalysisTags) imgAnalysisTags.innerHTML = '';

        const allTags = [
            { label: '🎨 วิเคราะห์สีและโทน',       delay: 400 },
            { label: '🔍 จดจำรูปทรงวัสดุ',           delay: 800 },
            { label: '🪵 ตรวจจับประเภทไม้/เหล็ก',    delay: 1100 },
            { label: '✅ จับคู่กับสินค้าในระบบ',       delay: 1500, matched: true },
        ];

        allTags.forEach(tag => {
            setTimeout(() => {
                if (!imgAnalysisTags) return;
                const el = document.createElement('span');
                el.className = 'analysis-tag' + (tag.matched ? ' matched' : '');
                el.textContent = tag.label;
                imgAnalysisTags.appendChild(el);
            }, tag.delay);
        });

        // Step 2: Determine category from color
        let matchedCategory = 'furniture';
        let matchedLabel = 'เฟอร์นิเจอร์ไม้และเหล็ก';
        if (colors.isGray && colors.isDark) { matchedCategory = 'cnc';       matchedLabel = 'งานเหล็ก/CNC'; }
        else if (colors.isLight)            { matchedCategory = 'glass';     matchedLabel = 'ประตูกระจก/เหล็ก'; }
        else if (colors.isWarm)             { matchedCategory = 'furniture'; matchedLabel = 'เฟอร์นิเจอร์ไม้ลอฟท์'; }

        setTimeout(() => {
            if (analysisText) analysisText.textContent = `พบสินค้าที่ใกล้เคียง: ${matchedLabel}`;
        }, 1600);

        // Step 3: Show results
        setTimeout(() => {
            if (imgAnalysisState) imgAnalysisState.classList.add('hide');
            showImageResults(matchedCategory);
        }, 2200);
    };

    const showImageResults = (primaryCategory) => {
        if (!imgSearchResults || !imgResultsGrid) return;

        // Sort: primary category first, others after
        const sorted = [...IMAGE_PRODUCTS].sort((a, b) => {
            const aMatch = a.category === primaryCategory ? 1 : 0;
            const bMatch = b.category === primaryCategory ? 1 : 0;
            return bMatch - aMatch || b.match - a.match;
        });

        if (imgResultsTitle) imgResultsTitle.textContent = `พบ ${sorted.length} สินค้าที่ตรงกัน`;

        imgResultsGrid.innerHTML = sorted.map((p, i) => `
            <div class="img-result-card" style="animation-delay:${i*80}ms" data-category="${p.category}">
                <img src="${p.img}" alt="${p.title}" loading="lazy">
                <span class="img-result-match-badge">${p.match}%</span>
                <div class="img-result-card-body">
                    <div class="rc-title">${p.title}</div>
                    <div class="rc-price">${p.price}</div>
                </div>
            </div>
        `).join('');

        // Click result → close modal & filter products
        imgResultsGrid.querySelectorAll('.img-result-card').forEach(card => {
            card.addEventListener('click', () => {
                const cat = card.getAttribute('data-category');
                closeImgModal();
                filterProducts(cat);
                scrollToCatalog();
            });
        });

        imgSearchResults.classList.remove('hide');
    };

    // Smooth Scroll Helper
    document.querySelectorAll('.scroll-to-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            if (targetId) {
                const targetEl = document.querySelector(targetId);
                if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
});

// Floating Contact Widget Logic
document.addEventListener('DOMContentLoaded', () => {
    const mainToggle = document.getElementById('contactMainToggle');
    const closeBtn = document.getElementById('contactCloseBtn');
    const contactCard = document.getElementById('contactWidgetCard');
    const contactForm = document.getElementById('contactDirectForm');
    const submitBtn = document.getElementById('directSubmitBtn');
    const successMsg = document.getElementById('contactSuccessMsg');

    if (mainToggle && contactCard) {
        // Toggle card visibility
        mainToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            contactCard.classList.toggle('show');
            mainToggle.classList.toggle('active');
        });

        // Close on close button
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                contactCard.classList.remove('show');
                mainToggle.classList.remove('active');
            });
        }

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!contactCard.contains(e.target) && !mainToggle.contains(e.target)) {
                contactCard.classList.remove('show');
                mainToggle.classList.remove('active');
            }
        });
    }

    // Direct Contact Form Submission
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameVal = document.getElementById('directName').value.trim();
            const contactVal = document.getElementById('directContact').value.trim();
            const messageVal = document.getElementById('directMessage').value.trim();

            if (!nameVal || !contactVal || !messageVal) return;

            // Show loading spinner
            if (submitBtn) {
                submitBtn.disabled = true;
                const spinner = submitBtn.querySelector('.btn-spinner');
                const text = submitBtn.querySelector('.btn-text');
                if (spinner) spinner.classList.remove('hide');
                if (text) text.classList.add('hide');
            }

            try {
                // Post to API
                const response = await fetch('/api/ironservice/contact-message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: nameVal,
                        contact: contactVal,
                        message: messageVal
                    })
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    // Show success state
                    if (successMsg) successMsg.classList.remove('hide');
                    contactForm.reset();
                    
                    // Hide success message after 4 seconds
                    setTimeout(() => {
                        if (successMsg) successMsg.classList.add('hide');
                    }, 4000);
                } else {
                    alert('ไม่สามารถส่งข้อความได้: ' + (result.error || 'กรุณาลองใหม่อีกครั้ง'));
                }
            } catch (err) {
                console.error('Contact Form Submit Error:', err);
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
            } finally {
                // Restore button state
                if (submitBtn) {
                    submitBtn.disabled = false;
                    const spinner = submitBtn.querySelector('.btn-spinner');
                    const text = submitBtn.querySelector('.btn-text');
                    if (spinner) spinner.classList.add('hide');
                    if (text) text.classList.remove('hide');
                }
            }
        });
    }

    // Call Button Time-based Visibility Control
    function updateCallButtonVisibility() {
        const callBtn = document.querySelector('.contact-call-btn');
        if (!callBtn) return;

        // Get current time in Thailand (UTC+7)
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const thaiTime = new Date(utc + (3600000 * 7));
        
        const hours = thaiTime.getHours();
        const minutes = thaiTime.getMinutes();
        const totalMinutes = hours * 60 + minutes;
        
        // 8:30 is 8 * 60 + 30 = 510 minutes
        // 20:00 is 20 * 60 = 1200 minutes
        const startMinutes = 510;
        const endMinutes = 1200;
        
        // HIDE calling option DURING 8:30 - 20:00 (As requested: "ซ่อนเบอร์โทร 8.30-20.00น.")
        // หากต้องการสลับพฤติกรรม (ให้เปิดโทรเฉพาะ 8:30 - 20:00 และซ่อนเวลาอื่น) ให้สลับบรรทัดโค้ดด้านล่างนี้แทน:
        // const shouldHide = totalMinutes < startMinutes || totalMinutes >= endMinutes;
        const shouldHide = totalMinutes >= startMinutes && totalMinutes < endMinutes;

        if (shouldHide) {
            callBtn.style.display = 'none';
            console.log('[CALL WIDGET] Hiding call button during Thai time 08:30 - 20:00');
        } else {
            callBtn.style.display = 'flex';
            console.log('[CALL WIDGET] Showing call button outside Thai time 08:30 - 20:00');
        }
    }

    // Run visibility check on load
    updateCallButtonVisibility();
    
    // Periodically check every 60 seconds
    setInterval(updateCallButtonVisibility, 60000);
});




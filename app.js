// AI Job Assistant Application
class JobAssistantApp {
    constructor() {
        this.currentView = 'dashboard';
        this.userProfile = this.loadProfile();
        this.jobs = this.getJobsData();
        this.skills = this.getSkillsData();
        this.careerPaths = this.getCareerPathsData();
        this.chatbotResponses = this.getChatbotResponses();
        this.init();
    }

    // Initialize the application
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.setupEventListeners();
        this.renderDashboard();
        this.renderJobs();
        this.renderCareerPaths();
        this.updateProfileProgress();
        console.log('App initialized successfully');
    }

    // Setup all event listeners
    setupEventListeners() {
        // Navigation - Use direct event listeners
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.target.getAttribute('data-view');
                console.log('Navigation clicked:', view);
                if (view) {
                    this.switchView(view);
                }
            });
        });

        // Dashboard actions - Use direct event listeners  
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.target.getAttribute('data-action');
                console.log('Dashboard action clicked:', action);
                this.handleDashboardAction(action);
            });
        });

        // Chat functionality
        const sendBtn = document.getElementById('sendBtn');
        const chatInput = document.getElementById('chatInput');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Send button clicked');
                this.sendMessage();
            });
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    console.log('Enter key pressed in chat');
                    this.sendMessage();
                }
            });
        }

        // Job filters
        const searchBtn = document.getElementById('searchJobs');
        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterJobs();
            });
        }

        ['locationFilter', 'experienceFilter', 'skillFilter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.filterJobs());
            }
        });

        // Profile form
        const saveBtn = document.getElementById('saveProfile');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }
        this.setupProfileListeners();

        // Modal
        const modalClose = document.querySelector('.modal-close');
        const modal = document.getElementById('jobModal');
        
        if (modalClose) {
            modalClose.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal();
            });
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'jobModal') {
                    e.preventDefault();
                    this.closeModal();
                }
            });
        }

        console.log('Event listeners setup complete');
    }

    // Switch between different views
    switchView(viewName) {
        console.log('Switching to view:', viewName);
        
        // Hide all views first
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
            view.style.display = 'none';
        });

        // Show target view
        const targetView = document.getElementById(viewName);
        if (targetView) {
            targetView.classList.add('active');
            targetView.style.display = 'block';
            console.log('View switched successfully to:', viewName);
        } else {
            console.error('Target view not found:', viewName);
            return;
        }

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeNav = document.querySelector(`[data-view="${viewName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }

        this.currentView = viewName;

        // Load view-specific data
        if (viewName === 'profile') {
            this.loadProfileForm();
        } else if (viewName === 'jobs') {
            this.renderJobs();
        } else if (viewName === 'career') {
            this.renderCareerPaths();
        }
    }

    // Handle dashboard actions
    handleDashboardAction(action) {
        console.log('Handling dashboard action:', action);
        
        switch (action) {
            case 'start-chat':
                this.switchView('chat');
                setTimeout(() => {
                    this.addBotMessage("Welcome to the job search chat! I can help you find jobs, provide career advice, and answer questions about skill development. What would you like to explore?");
                }, 500);
                break;
            case 'browse-jobs':
                this.switchView('jobs');
                break;
            case 'quick-match':
                this.switchView('chat');
                setTimeout(() => {
                    this.addBotMessage("Let me find some job matches for you based on popular roles!");
                    this.displayJobsInChat(this.jobs.slice(0, 3));
                }, 500);
                break;
            case 'career-chat':
                this.switchView('chat');
                setTimeout(() => {
                    this.addBotMessage("I'd be happy to help with your career development! What specific career questions do you have? I can provide guidance on career paths, skill development, industry trends, and more.");
                }, 500);
                break;
            case 'skill-analysis':
                this.switchView('career');
                break;
        }
    }

    // Chat functionality
    sendMessage() {
        const input = document.getElementById('chatInput');
        if (!input) {
            console.error('Chat input not found');
            return;
        }
        
        const message = input.value.trim();
        console.log('Sending message:', message);
        
        if (!message) return;

        this.addUserMessage(message);
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Process message with delay
        setTimeout(() => {
            this.hideTypingIndicator();
            this.processUserMessage(message);
        }, 800);
    }

    addUserMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) {
            console.error('Chat messages container not found');
            return;
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        this.scrollChatToBottom();
    }

    addBotMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) {
            console.error('Chat messages container not found');
            return;
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        this.scrollChatToBottom();
    }

    scrollChatToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        // Remove existing typing indicator
        const existing = document.getElementById('typingIndicator');
        if (existing) existing.remove();
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    AI is typing
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        this.scrollChatToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    processUserMessage(message) {
        console.log('Processing user message:', message);
        const lowerMessage = message.toLowerCase();
        
        if (this.isJobSearchQuery(lowerMessage)) {
            this.handleJobSearchQuery(message);
        } else if (this.isCareerAdviceQuery(lowerMessage)) {
            this.handleCareerAdviceQuery();
        } else if (this.isSkillQuery(lowerMessage)) {
            this.handleSkillQuery();
        } else if (this.isGreeting(lowerMessage)) {
            this.handleGreeting();
        } else {
            this.handleGeneralQuery();
        }
    }

    isJobSearchQuery(message) {
        const jobKeywords = ['job', 'jobs', 'position', 'role', 'work', 'employment', 'hiring', 'remote', 'salary', 'python', 'javascript', 'engineer', 'developer', 'manager', 'find', 'search'];
        return jobKeywords.some(keyword => message.includes(keyword));
    }

    isCareerAdviceQuery(message) {
        const careerKeywords = ['career', 'transition', 'advice', 'development', 'growth', 'path', 'guidance', 'promote', 'advancement'];
        return careerKeywords.some(keyword => message.includes(keyword));
    }

    isSkillQuery(message) {
        const skillKeywords = ['skill', 'skills', 'learn', 'learning', 'technology', 'course', 'training', 'certification'];
        return skillKeywords.some(keyword => message.includes(keyword));
    }

    isGreeting(message) {
        const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'];
        return greetings.some(greeting => message.includes(greeting));
    }

    handleJobSearchQuery(message) {
        const matchedJobs = this.findMatchingJobs(message);
        console.log('Found matching jobs:', matchedJobs.length);
        
        if (matchedJobs.length > 0) {
            this.addBotMessage("I found some great job opportunities that match your search! Here are the top results:");
            setTimeout(() => {
                this.displayJobsInChat(matchedJobs.slice(0, 3));
            }, 500);
        } else {
            this.addBotMessage("I couldn't find exact matches for your search, but here are some popular opportunities in the tech industry:");
            setTimeout(() => {
                this.displayJobsInChat(this.jobs.slice(0, 3));
            }, 500);
        }
    }

    handleCareerAdviceQuery() {
        const adviceResponses = [
            "Career development is a journey! Based on current industry trends, I recommend focusing on continuous learning, networking, and staying updated with technology trends. What specific career aspect would you like to explore?",
            "Great question about career development! The key to career growth is identifying your strengths and aligning them with market opportunities. Would you like me to analyze potential career paths?",
            "Career transitions can be exciting! The most important factors are skill development, networking, understanding market demand, and having clear goals. What type of career change are you considering?"
        ];
        
        const response = adviceResponses[Math.floor(Math.random() * adviceResponses.length)];
        this.addBotMessage(response);
    }

    handleSkillQuery() {
        const skillResponses = [
            "Skill development is crucial in today's market! Based on current trends, I recommend focusing on: Python, JavaScript, Cloud technologies (AWS/Azure), Machine Learning, and soft skills like communication and problem-solving. What area interests you most?",
            "Here are some high-demand skills worth learning: Data Science & Analytics, Full-stack Development, DevOps & Cloud Computing, AI/Machine Learning, and Cybersecurity. Which field aligns with your career goals?",
            "The most valuable skills right now include: Programming languages (Python, JavaScript), Cloud platforms, Data analysis, Digital marketing, and leadership skills. Would you like specific learning resources for any of these?"
        ];
        
        const response = skillResponses[Math.floor(Math.random() * skillResponses.length)];
        this.addBotMessage(response);
    }

    handleGreeting() {
        const greetings = [
            "Hello! I'm your AI job search assistant. How can I help you find your next opportunity today?",
            "Hi there! Ready to explore some amazing job opportunities? What are you looking for?",
            "Welcome! I'm here to help you navigate your career journey. What can I assist you with?"
        ];
        const response = greetings[Math.floor(Math.random() * greetings.length)];
        this.addBotMessage(response);
    }

    handleGeneralQuery() {
        const generalResponses = [
            "That's an interesting question! I specialize in job search and career development. How can I help you with your professional journey?",
            "I'd be happy to help! I can assist with job recommendations, career advice, skill development, and industry insights. What would you like to explore?",
            "Let me help you with that! I'm designed to support your career growth through job matching, skill analysis, and professional guidance. What specific area can I assist you with?"
        ];
        
        const response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
        this.addBotMessage(response);
    }

    findMatchingJobs(query) {
        const queryLower = query.toLowerCase();
        return this.jobs.filter(job => {
            const titleMatch = job.title.toLowerCase().includes(queryLower) || 
                              queryLower.includes(job.title.toLowerCase().split(' ')[0]);
            const skillsMatch = job.skills.some(skill => 
                queryLower.includes(skill.toLowerCase()) || 
                skill.toLowerCase().includes(queryLower)
            );
            const locationMatch = job.location.toLowerCase().includes(queryLower);
            const descriptionMatch = job.description.toLowerCase().includes(queryLower);
            
            return titleMatch || skillsMatch || locationMatch || descriptionMatch;
        });
    }

    displayJobsInChat(jobs) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        jobs.forEach((job, index) => {
            setTimeout(() => {
                const jobDiv = document.createElement('div');
                jobDiv.className = 'message bot-message';
                jobDiv.innerHTML = `
                    <div class="message-content">
                        <div class="chat-job-card" onclick="window.app.openJobModal(${job.id})">
                            <h4>${this.escapeHtml(job.title)}</h4>
                            <p style="margin: 4px 0; color: var(--color-text-secondary);">${this.escapeHtml(job.company)} • ${this.escapeHtml(job.location)}</p>
                            <p style="margin: 8px 0; font-size: var(--font-size-sm);">${this.escapeHtml(job.description.substring(0, 100))}...</p>
                            <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                                <span class="job-meta-item job-salary">${this.escapeHtml(job.salary)}</span>
                                <span class="job-meta-item">${this.escapeHtml(job.experience)}</span>
                                ${job.remote ? '<span class="job-meta-item">🌐 Remote</span>' : ''}
                            </div>
                        </div>
                    </div>
                `;
                chatMessages.appendChild(jobDiv);
                this.scrollChatToBottom();
            }, index * 300);
        });
    }

    // Job management
    renderJobs() {
        this.displayJobs(this.jobs);
        this.renderRecentJobs();
    }

    displayJobs(jobs) {
        const container = document.getElementById('jobs-container');
        if (!container) return;
        
        container.innerHTML = '';

        if (jobs.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No jobs found matching your criteria.</p>';
            return;
        }

        jobs.forEach(job => {
            const jobCard = this.createJobCard(job);
            container.appendChild(jobCard);
        });
    }

    createJobCard(job) {
        const card = document.createElement('div');
        card.className = 'job-card';
        card.style.cursor = 'pointer';
        
        // Add click handler
        card.addEventListener('click', (e) => {
            e.preventDefault();
            this.openJobModal(job.id);
        });
        
        card.innerHTML = `
            <div class="job-header">
                <div>
                    <h3 class="job-title">${this.escapeHtml(job.title)}</h3>
                    <p class="job-company">${this.escapeHtml(job.company)}</p>
                    <p class="job-location">📍 ${this.escapeHtml(job.location)}</p>
                </div>
            </div>
            
            <div class="job-meta">
                <span class="job-meta-item job-salary">${this.escapeHtml(job.salary)}</span>
                <span class="job-meta-item">${this.escapeHtml(job.experience)}</span>
                <span class="job-meta-item">${this.escapeHtml(job.type)}</span>
                ${job.remote ? '<span class="job-meta-item">🌐 Remote</span>' : ''}
            </div>
            
            <div class="job-skills">
                ${job.skills.map(skill => `<span class="skill-tag">${this.escapeHtml(skill)}</span>`).join('')}
            </div>
            
            <p class="job-description">${this.escapeHtml(job.description)}</p>
            
            <div class="job-actions" onclick="event.stopPropagation()">
                <button class="btn btn--primary btn--sm">Apply Now</button>
                <button class="btn btn--secondary btn--sm">Save Job</button>
            </div>
        `;
        
        return card;
    }

    renderRecentJobs() {
        const container = document.getElementById('recent-jobs-container');
        if (!container) return;
        
        const recentJobs = this.jobs.slice(0, 3);
        
        container.innerHTML = '';
        recentJobs.forEach(job => {
            const jobCard = this.createJobCard(job);
            container.appendChild(jobCard);
        });
    }

    filterJobs() {
        const locationFilter = document.getElementById('locationFilter');
        const experienceFilter = document.getElementById('experienceFilter');
        const skillFilter = document.getElementById('skillFilter');
        
        const location = locationFilter ? locationFilter.value : '';
        const experience = experienceFilter ? experienceFilter.value : '';
        const skill = skillFilter ? skillFilter.value : '';

        let filteredJobs = this.jobs;

        if (location) {
            filteredJobs = filteredJobs.filter(job => 
                job.location.includes(location) || (location === 'Remote' && job.remote)
            );
        }

        if (experience) {
            filteredJobs = filteredJobs.filter(job => job.experience.includes(experience));
        }

        if (skill) {
            filteredJobs = filteredJobs.filter(job => 
                job.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
            );
        }

        this.displayJobs(filteredJobs);
    }

    openJobModal(jobId) {
        console.log('Opening job modal for:', jobId);
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;

        const modal = document.getElementById('jobModal');
        const modalTitle = document.getElementById('modalJobTitle');
        const modalContent = document.getElementById('modalJobContent');
        
        if (!modal || !modalTitle || !modalContent) return;

        modalTitle.textContent = job.title;
        modalContent.innerHTML = `
            <div style="margin-bottom: 16px;">
                <strong>Company:</strong> ${this.escapeHtml(job.company)}<br>
                <strong>Location:</strong> ${this.escapeHtml(job.location)}<br>
                <strong>Type:</strong> ${this.escapeHtml(job.type)}<br>
                <strong>Experience:</strong> ${this.escapeHtml(job.experience)}<br>
                <strong>Salary:</strong> ${this.escapeHtml(job.salary)}<br>
                ${job.remote ? '<strong>Remote:</strong> Yes<br>' : ''}
                <strong>Posted:</strong> ${this.escapeHtml(job.posted)}
            </div>
            
            <div style="margin: 16px 0;">
                <strong>Required Skills:</strong><br>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                    ${job.skills.map(skill => `<span class="skill-tag">${this.escapeHtml(skill)}</span>`).join('')}
                </div>
            </div>
            
            <div style="margin: 16px 0;">
                <strong>Job Description:</strong><br>
                <p style="margin-top: 8px; line-height: 1.6;">${this.escapeHtml(job.description)}</p>
            </div>
        `;

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }

    closeModal() {
        const modal = document.getElementById('jobModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    // Profile management
    setupProfileListeners() {
        const fields = ['fullName', 'email', 'location', 'currentRole', 'experienceLevel', 'skills', 'salaryRange'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', () => this.updateProfileProgress());
            }
        });
    }

    loadProfileForm() {
        if (!this.userProfile) return;

        const fields = ['fullName', 'email', 'location', 'currentRole', 'experienceLevel', 'skills', 'salaryRange'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && this.userProfile[field]) {
                element.value = Array.isArray(this.userProfile[field]) 
                    ? this.userProfile[field].join(', ') 
                    : this.userProfile[field];
            }
        });

        this.updateProfileProgress();
    }

    saveProfile() {
        const profile = {
            fullName: this.getFieldValue('fullName'),
            email: this.getFieldValue('email'),
            location: this.getFieldValue('location'),
            currentRole: this.getFieldValue('currentRole'),
            experienceLevel: this.getFieldValue('experienceLevel'),
            skills: this.getFieldValue('skills').split(',').map(s => s.trim()).filter(s => s),
            salaryRange: this.getFieldValue('salaryRange'),
            jobTypes: Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value)
        };

        this.userProfile = profile;
        this.showNotification('Profile saved successfully!');
        this.updateProfileProgress();
    }

    getFieldValue(fieldId) {
        const element = document.getElementById(fieldId);
        return element ? element.value : '';
    }

    updateProfileProgress() {
        const fields = ['fullName', 'email', 'location', 'currentRole', 'experienceLevel', 'skills'];
        let filledFields = 0;
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.value.trim()) {
                filledFields++;
            }
        });
        
        const progress = Math.round((filledFields / fields.length) * 100);
        const progressElement = document.getElementById('profileProgress');
        const progressFill = document.getElementById('progressFill');
        
        if (progressElement) progressElement.textContent = `${progress}%`;
        if (progressFill) progressFill.style.width = `${progress}%`;
    }

    loadProfile() {
        return {};
    }

    // Career development
    renderCareerPaths() {
        const container = document.getElementById('career-paths');
        if (!container) return;
        
        container.innerHTML = '';

        this.careerPaths.forEach(path => {
            const pathCard = document.createElement('div');
            pathCard.className = 'career-path-card';
            
            pathCard.innerHTML = `
                <h3>${this.escapeHtml(path.title)}</h3>
                <p>${this.escapeHtml(path.description)}</p>
                <div style="margin: 16px 0;">
                    <strong>Career Progression:</strong>
                    <div class="career-levels">
                        ${path.levels.map(level => `<div class="career-level">${this.escapeHtml(level)}</div>`).join('')}
                    </div>
                </div>
                <div>
                    <strong>Key Skills:</strong>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                        ${path.skills.map(skill => `<span class="skill-tag">${this.escapeHtml(skill)}</span>`).join('')}
                    </div>
                </div>
            `;
            
            container.appendChild(pathCard);
        });

        this.renderSkillRecommendations();
    }

    renderSkillRecommendations() {
        const container = document.getElementById('skill-recommendations');
        if (!container) return;
        
        const recommendedSkills = ['Python', 'JavaScript', 'Cloud Computing', 'Machine Learning', 'Data Analysis', 'Project Management', 'Communication', 'Problem Solving'];
        
        container.innerHTML = '';
        recommendedSkills.forEach(skill => {
            const skillSpan = document.createElement('span');
            skillSpan.className = 'skill-recommendation';
            skillSpan.textContent = skill;
            container.appendChild(skillSpan);
        });
    }

    // Dashboard
    renderDashboard() {
        // Dashboard is mostly static, but we can add dynamic content here
        setTimeout(() => {
            this.renderRecentJobs();
        }, 100);
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message) {
        alert(message);
    }

    // Data methods
    getJobsData() {
        return [
            {
                id: 1,
                title: "Senior Software Engineer",
                company: "TechCorp Solutions",
                location: "Bangalore, India",
                type: "Full-time",
                experience: "3-5 years",
                skills: ["Python", "Django", "REST APIs", "PostgreSQL", "Docker"],
                salary: "₹12-18 LPA",
                description: "Looking for a skilled software engineer to join our backend development team. Work on scalable web applications and microservices architecture.",
                remote: false,
                posted: "2 days ago"
            },
            {
                id: 2,
                title: "Data Scientist",
                company: "DataInsights Inc",
                location: "Mumbai, India",
                type: "Full-time",
                experience: "2-4 years",
                skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Pandas"],
                salary: "₹10-16 LPA",
                description: "Join our AI team to build predictive models and derive insights from large datasets. Experience with ML algorithms required.",
                remote: true,
                posted: "1 day ago"
            },
            {
                id: 3,
                title: "Frontend Developer",
                company: "WebTech Studios",
                location: "Remote",
                type: "Full-time",
                experience: "1-3 years",
                skills: ["React", "JavaScript", "HTML", "CSS", "Node.js"],
                salary: "₹8-12 LPA",
                description: "Create beautiful and responsive user interfaces for web applications. Strong knowledge of modern JavaScript frameworks required.",
                remote: true,
                posted: "3 days ago"
            },
            {
                id: 4,
                title: "DevOps Engineer",
                company: "CloudOps Ltd",
                location: "Hyderabad, India",
                type: "Full-time",
                experience: "2-5 years",
                skills: ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform"],
                salary: "₹14-20 LPA",
                description: "Manage cloud infrastructure and CI/CD pipelines. Experience with containerization and infrastructure as code essential.",
                remote: false,
                posted: "1 week ago"
            },
            {
                id: 5,
                title: "Product Manager",
                company: "InnovateTech",
                location: "Delhi, India",
                type: "Full-time",
                experience: "4-7 years",
                skills: ["Product Strategy", "Agile", "Analytics", "Market Research", "Leadership"],
                salary: "₹18-25 LPA",
                description: "Lead product development lifecycle from conception to launch. Strong analytical and leadership skills required.",
                remote: false,
                posted: "5 days ago"
            },
            {
                id: 6,
                title: "UX Designer",
                company: "DesignFlow Agency",
                location: "Pune, India",
                type: "Full-time",
                experience: "2-4 years",
                skills: ["Figma", "Adobe Creative Suite", "User Research", "Prototyping", "Wireframing"],
                salary: "₹9-14 LPA",
                description: "Design intuitive user experiences for digital products. Portfolio demonstrating UX process and thinking required.",
                remote: true,
                posted: "4 days ago"
            },
            {
                id: 7,
                title: "Cybersecurity Analyst",
                company: "SecureNet Systems",
                location: "Chennai, India",
                type: "Full-time",
                experience: "2-5 years",
                skills: ["Network Security", "Penetration Testing", "SIEM", "Incident Response", "Risk Assessment"],
                salary: "₹11-17 LPA",
                description: "Monitor and protect organizational systems from cyber threats. Experience with security tools and frameworks required.",
                remote: false,
                posted: "6 days ago"
            },
            {
                id: 8,
                title: "Mobile App Developer",
                company: "AppCraft Solutions",
                location: "Remote",
                type: "Full-time",
                experience: "1-4 years",
                skills: ["React Native", "Flutter", "iOS", "Android", "Mobile UI/UX"],
                salary: "₹7-13 LPA",
                description: "Develop cross-platform mobile applications. Experience with native and hybrid app development preferred.",
                remote: true,
                posted: "2 days ago"
            },
            {
                id: 9,
                title: "AI/ML Engineer",
                company: "AI Innovations Lab",
                location: "Bangalore, India",
                type: "Full-time",
                experience: "3-6 years",
                skills: ["Python", "TensorFlow", "PyTorch", "Deep Learning", "Computer Vision"],
                salary: "₹15-22 LPA",
                description: "Build and deploy machine learning models for production systems. Strong background in AI/ML algorithms required.",
                remote: true,
                posted: "3 days ago"
            },
            {
                id: 10,
                title: "Digital Marketing Specialist",
                company: "GrowthHack Marketing",
                location: "Mumbai, India",
                type: "Full-time",
                experience: "2-4 years",
                skills: ["SEO", "Google Ads", "Social Media Marketing", "Analytics", "Content Marketing"],
                salary: "₹6-10 LPA",
                description: "Drive digital marketing campaigns and growth strategies. Experience with performance marketing and analytics tools required.",
                remote: false,
                posted: "1 week ago"
            }
        ];
    }

    getSkillsData() {
        return [
            "Python", "JavaScript", "Java", "C++", "React", "Angular", "Vue.js", "Node.js", "Django", "Flask",
            "Machine Learning", "Deep Learning", "Data Science", "SQL", "PostgreSQL", "MongoDB", "MySQL",
            "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins", "Git", "Linux", "REST APIs", "GraphQL",
            "HTML", "CSS", "Sass", "Bootstrap", "Tailwind CSS", "Figma", "Adobe Creative Suite", "Sketch",
            "Agile", "Scrum", "Project Management", "Leadership", "Communication", "Problem Solving",
            "Network Security", "Penetration Testing", "SIEM", "Risk Assessment", "Incident Response",
            "SEO", "Google Ads", "Social Media Marketing", "Content Marketing", "Analytics", "Market Research",
            "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "Computer Vision", "NLP"
        ];
    }

    getCareerPathsData() {
        return [
            {
                title: "Software Development",
                levels: ["Junior Developer", "Software Engineer", "Senior Engineer", "Tech Lead", "Engineering Manager"],
                skills: ["Programming Languages", "Frameworks", "Databases", "Version Control", "Testing"],
                description: "Build software applications and systems from web apps to enterprise solutions"
            },
            {
                title: "Data Science",
                levels: ["Data Analyst", "Data Scientist", "Senior Data Scientist", "Principal Data Scientist", "Head of Data"],
                skills: ["Statistics", "Machine Learning", "Python/R", "SQL", "Data Visualization"],
                description: "Extract insights from data to drive business decisions and build predictive models"
            },
            {
                title: "Product Management",
                levels: ["Associate PM", "Product Manager", "Senior PM", "Principal PM", "VP of Product"],
                skills: ["Strategy", "Analytics", "User Research", "Agile", "Stakeholder Management"],
                description: "Guide product development from conception to market success"
            },
            {
                title: "DevOps/SRE",
                levels: ["DevOps Engineer", "Senior DevOps", "SRE", "Principal SRE", "Platform Engineering Lead"],
                skills: ["Cloud Platforms", "Infrastructure as Code", "CI/CD", "Monitoring", "Automation"],
                description: "Ensure reliable, scalable, and efficient software delivery and operations"
            }
        ];
    }

    getChatbotResponses() {
        return {
            greetings: [
                "Hello! I'm your AI job search assistant. How can I help you find your next opportunity today?",
                "Hi there! Ready to explore some amazing job opportunities? What are you looking for?",
                "Welcome! I'm here to help you navigate your career journey. What can I assist you with?"
            ]
        };
    }
}

// Initialize the application when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new JobAssistantApp();
    // Expose app globally for debugging and modal callbacks
    window.app = app;
});
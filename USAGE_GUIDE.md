# EduSphere Portal - Quick Operations & Testing Guide

This guide provides step-by-step instructions on how to set up, register, onboard, and log in to the EduSphere LMS portal under different user roles.

---

## 🔑 Default Super Admin Credentials
On backend startup, the system automatically seeds a default Super Admin account if it does not already exist:
* **URL**: `http://localhost:3000/login`
* **Email**: `superadmin@edusphere.com`
* **Password**: `SuperAdmin123!`

---

## 📁 Core Flow: Setup to Student Study

Follow these 6 steps to test the entire tenant, curriculum, attendance, and student tracking cycle:

### Step 1: Create an Institute (Super Admin)
1. Navigate to the Login page (`http://localhost:3000/login`) and log in using the **Default Super Admin** credentials.
2. Go to the **Institutes** management page in the sidebar.
3. Click the **"Onboard Institute"** button.
4. Enter the details (e.g., Name: `Greenwood Academy`, Code: `GW101`) and submit.

---

### Step 2: Register an Institute Admin
1. Click **Log Out** in the dashboard header.
2. Navigate to the Registration page: `http://localhost:3000/register`.
3. Enter your name, email, and password.
4. Select the newly created institute (`Greenwood Academy`) from the dropdown list.
5. Click **"Register"** to create the school administration account. You will be automatically logged in to your **Institute Admin Console**.

---

### Step 3: Onboard a Teacher (Institute Admin)
1. Inside the Institute Admin Console, go to the **Teachers** tab.
2. Click **"Onboard Teacher"**.
3. Input the teacher's details:
   - **Name**: `Professor Richard Feynman`
   - **Email**: `feynman@greenwood.com`
   - **Temporary Password**: `feynman123` (min 6 characters)
4. Submit the form to register the instructor.

---

### Step 4: Register a Student (Institute Admin)
1. Go to the **Students** tab in the sidebar.
2. Click **"Register Student"**.
3. Fill in the student onboarding profile:
   - **First Name**: `Jane`
   - **Last Name**: `Doe`
   - **Email**: `jane.doe@greenwood.com`
   - **Admission Number**: `GW-2026-101` 💡 *Note: Keep track of this, it will be the student's login password.*
   - **Profile Picture**: Upload an image (optional).
4. Click **"Register Student"** to save.

---

### Step 5: Course Setup & Attendance (Teacher Login)
1. **Log Out** of the Admin account.
2. Log in at `http://localhost:3000/login` using the teacher's credentials:
   - **Email**: `feynman@greenwood.com`
   - **Password**: `feynman123`
3. **Add Course**:
   - Go to **My Courses**. Click **"Create Course"**.
   - Fill in details (Title: `Physics I`, category, thumbnail) and create it.
4. **Add Video Lesson**:
   - Click on the newly created course to enter the classroom.
   - Click **"Add Lesson"** in the Syllabus checklist.
   - Enter a title, YouTube URL (e.g. `https://www.youtube.com/watch?v=dQw4w9WgXcQ`), duration, and summary. Click **Save**.
5. **Mark Attendance**:
   - Go to **Record Attendance** in the sidebar.
   - Select the course and date, select **Present** or **Absent** for `Jane Doe`, and click **"Save Attendance"**.

---

### Step 6: Watch Lectures & Complete Progress (Student Login)
1. **Log Out** of the Teacher account.
2. Log in at `http://localhost:3000/login` using the student's credentials:
   - **Email**: `jane.doe@greenwood.com`
   - **Password**: `GW-2026-101` *(The student's Admission Number)*
3. **Student Learning Desk**:
   - You will see the student dashboard statistics showing your active courses and your attendance ratio.
4. **Study & Watch Videos**:
   - Click **"Study Now"** on the `Physics I` course.
   - The interactive classroom loads.
   - Use the **Syllabus Playlist** on the right to select lessons. The YouTube video will render inside the **Video Player iframe** on the left.
5. **Mark Complete**:
   - After watching, click **"Mark Complete"** under the video player. 
   - The progress percentage is updated instantly on your dashboard!

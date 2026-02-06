"""
Populate the database with realistic sample data so the app
has content to display right away during demos.
"""

import asyncio
from datetime import datetime, date, timedelta
from app.database import async_session, init_db
from app.models.models import (
    User, MessMenu, MealType, NearbyPlace,
    MarketplaceItem, LostFoundItem, LostFoundType, ItemStatus,
    CabTrip, TripStatus, TimetableEntry, Assignment, MailItem, MailCategory,
)
from app.utils.auth import hash_password


async def seed():
    await init_db()
    async with async_session() as db:
        # check if already seeded
        from sqlalchemy import select
        existing = await db.execute(select(User).limit(1))
        if existing.scalar_one_or_none():
            print("Database already seeded, skipping.")
            return

        # ---- users ----
        demo_pass = hash_password("password123")
        users = [
            User(email="arjun@iitrpr.ac.in", username="arjun_s", full_name="Arjun Sharma",
                 hashed_password=demo_pass, branch="CSE", year=3, phone="9876543210"),
            User(email="priya@iitrpr.ac.in", username="priya_m", full_name="Priya Mehra",
                 hashed_password=demo_pass, branch="EE", year=2, phone="9876543211"),
            User(email="rahul@iitrpr.ac.in", username="rahul_k", full_name="Rahul Kumar",
                 hashed_password=demo_pass, branch="ME", year=4, phone="9876543212"),
            User(email="sneha@iitrpr.ac.in", username="sneha_g", full_name="Sneha Gupta",
                 hashed_password=demo_pass, branch="CSE", year=1, phone="9876543213"),
            User(email="prof.verma@iitrpr.ac.in", username="prof_verma", full_name="Dr. Anil Verma",
                 hashed_password=demo_pass, role="faculty", branch="CSE", phone="9876543214"),
        ]
        db.add_all(users)
        await db.commit()
        for u in users:
            await db.refresh(u)

        today = date.today()

        # ---- mess menus (7 days) ----
        menu_data = [
            ("breakfast", "Aloo Paratha, Curd, Butter, Tea, Boiled Eggs, Cornflakes",
             "Calories: 450, Protein: 15g, Carbs: 60g", "gluten, dairy"),
            ("lunch", "Dal Makhani, Jeera Rice, Roti, Mixed Veg, Salad, Raita",
             "Calories: 650, Protein: 20g, Carbs: 80g", "gluten, dairy"),
            ("snacks", "Samosa, Chai, Bread Pakora, Fruit",
             "Calories: 250, Protein: 5g, Carbs: 35g", "gluten"),
            ("dinner", "Paneer Butter Masala, Naan, Rice, Dal Tadka, Gulab Jamun",
             "Calories: 700, Protein: 22g, Carbs: 85g", "gluten, dairy, nuts"),
        ]
        alt_menu = [
            ("breakfast", "Poha, Jalebi, Milk, Banana, Toast with Jam",
             "Calories: 400, Protein: 10g, Carbs: 55g", "gluten, dairy"),
            ("lunch", "Rajma Chawal, Chapati, Aloo Gobi, Cucumber Salad, Buttermilk",
             "Calories: 600, Protein: 18g, Carbs: 75g", "gluten, dairy"),
            ("snacks", "Maggi, Cold Coffee, Biscuits",
             "Calories: 300, Protein: 8g, Carbs: 40g", "gluten, dairy"),
            ("dinner", "Chole Bhature, Rice, Mix Dal, Ice Cream",
             "Calories: 750, Protein: 20g, Carbs: 90g", "gluten, dairy"),
        ]
        for offset in range(7):
            d = (today + timedelta(days=offset)).isoformat()
            source = menu_data if offset % 2 == 0 else alt_menu
            for meal_type, items, nutri, allergens in source:
                db.add(MessMenu(
                    date=d, meal_type=MealType(meal_type),
                    items=items, nutritional_info=nutri, allergens=allergens,
                ))

        # ---- nearby places ----
        places = [
            NearbyPlace(name="Sharma Dhaba", category="restaurant",
                        description="Classic North Indian food with generous portions. A student favourite since 2015.",
                        address="Main Road, Rupnagar", phone="9812345001",
                        vibe_tags="budget,late-night,group-friendly",
                        avg_cost=120, opening_hours="10:00 AM - 11:00 PM",
                        student_discount=True, latitude=30.9660, longitude=76.5230),
            NearbyPlace(name="Café Unplugged", category="cafe",
                        description="Quiet cafe with strong WiFi and decent coffee. Perfect for study sessions or group projects.",
                        address="Near Bus Stand, Rupnagar", phone="9812345002",
                        vibe_tags="study-friendly,wifi,coffee,quiet",
                        avg_cost=180, opening_hours="8:00 AM - 10:00 PM",
                        student_discount=True, latitude=30.9670, longitude=76.5250),
            NearbyPlace(name="Ropar Wetland", category="attraction",
                        description="Beautiful bird sanctuary and wetland area. Great for weekend walks and photography.",
                        address="Ropar Headworks", phone="",
                        vibe_tags="nature,photography,weekend,peaceful",
                        avg_cost=0, opening_hours="6:00 AM - 6:00 PM",
                        latitude=30.9700, longitude=76.5300),
            NearbyPlace(name="Pizza Point", category="restaurant",
                        description="Affordable pizzas and pastas. Decent variety and quick delivery to campus.",
                        address="College Road, Rupnagar", phone="9812345003",
                        vibe_tags="pizza,delivery,late-night,budget",
                        avg_cost=200, opening_hours="11:00 AM - 11:30 PM",
                        student_discount=False, latitude=30.9665, longitude=76.5240),
            NearbyPlace(name="Giani's", category="dessert",
                        description="Popular ice cream and shake spot. The rabri faluda is a must-try.",
                        address="Main Market, Rupnagar", phone="9812345004",
                        vibe_tags="dessert,date-spot,evening",
                        avg_cost=150, opening_hours="11:00 AM - 10:30 PM",
                        student_discount=False, latitude=30.9662, longitude=76.5235),
            NearbyPlace(name="Campus Library Café", category="cafe",
                        description="Small canteen inside the library building. Quick bites between study sessions.",
                        address="IIT Ropar Campus", phone="",
                        vibe_tags="on-campus,quick-bite,budget,study-friendly",
                        avg_cost=50, opening_hours="9:00 AM - 8:00 PM",
                        student_discount=True, latitude=30.9710, longitude=76.5280),
        ]
        db.add_all(places)

        # ---- marketplace items ----
        items = [
            MarketplaceItem(seller_id=users[0].id, title="Engineering Mathematics Textbook (Kreyszig)",
                            description="Used for 1 semester. Some highlighting but otherwise clean. 10th edition.",
                            price=350, category="textbooks", condition="good"),
            MarketplaceItem(seller_id=users[1].id, title="Casio FX-991EX Scientific Calculator",
                            description="Working perfectly. Selling because I got a new one as a gift.",
                            price=800, category="electronics", condition="excellent"),
            MarketplaceItem(seller_id=users[2].id, title="Hero Sprint 26T Cycle",
                            description="Used for 2 years on campus. Regular servicing done. Minor scratches.",
                            price=2500, category="cycles", condition="fair"),
            MarketplaceItem(seller_id=users[0].id, title="Wooden Study Table",
                            description="Solid wood table, fits perfectly in hostel rooms. Selling because graduating.",
                            price=1200, category="furniture", condition="good"),
            MarketplaceItem(seller_id=users[3].id, title="JBL Flip 5 Bluetooth Speaker",
                            description="6 months old, barely used. Comes with original box and charger.",
                            price=4500, category="electronics", condition="excellent"),
        ]
        db.add_all(items)

        # ---- lost & found ----
        lf_items = [
            LostFoundItem(reporter_id=users[0].id, item_type=LostFoundType.lost,
                          title="Blue Wildcraft Backpack",
                          description="Left in LHC Room 203 after the DSA lecture on Monday. Has a sticker of a penguin on the front pocket.",
                          location="LHC Room 203", category="bags",
                          contact_info="9876543210"),
            LostFoundItem(reporter_id=users[1].id, item_type=LostFoundType.found,
                          title="USB Drive (32GB SanDisk)",
                          description="Found near the library entrance. Silver colored with a blue cap.",
                          location="Library Entrance", category="electronics",
                          contact_info="9876543211"),
            LostFoundItem(reporter_id=users[3].id, item_type=LostFoundType.lost,
                          title="Prescription Glasses (Black Frame)",
                          description="Lost somewhere between hostel and academic block. Black rectangular frames, -2.5 power.",
                          location="Campus Road", category="personal",
                          contact_info="9876543213"),
        ]
        db.add_all(lf_items)

        # ---- cab trips ----
        trips = [
            CabTrip(creator_id=users[0].id, origin="IIT Ropar Campus",
                    destination="Chandigarh Railway Station",
                    departure_time=datetime.now() + timedelta(days=2, hours=6),
                    seats_total=4, seats_available=2, price_per_person=200,
                    notes="Going for a weekend trip. Can drop at Sector 17 too.",
                    contact_number="9876543210"),
            CabTrip(creator_id=users[2].id, origin="IIT Ropar Campus",
                    destination="Delhi Airport (T3)",
                    departure_time=datetime.now() + timedelta(days=5, hours=4),
                    seats_total=4, seats_available=3, price_per_person=600,
                    notes="Flight at 2 PM. Leaving early morning.",
                    contact_number="9876543212"),
        ]
        db.add_all(trips)

        # ---- timetable ----
        tt_entries = [
            TimetableEntry(user_id=users[0].id, course_code="CS301", course_name="Data Structures & Algorithms",
                           instructor="Dr. Anil Verma", day_of_week=0, start_time="09:00", end_time="10:00", room="LHC-203"),
            TimetableEntry(user_id=users[0].id, course_code="CS302", course_name="Operating Systems",
                           instructor="Dr. Priya Singh", day_of_week=0, start_time="10:00", end_time="11:00", room="LHC-204"),
            TimetableEntry(user_id=users[0].id, course_code="MA301", course_name="Probability & Statistics",
                           instructor="Dr. Rahul Jain", day_of_week=1, start_time="09:00", end_time="10:00", room="LHC-101"),
            TimetableEntry(user_id=users[0].id, course_code="CS301", course_name="Data Structures & Algorithms",
                           instructor="Dr. Anil Verma", day_of_week=2, start_time="09:00", end_time="10:00", room="LHC-203"),
            TimetableEntry(user_id=users[0].id, course_code="CS303", course_name="Computer Networks",
                           instructor="Dr. Meena Sharma", day_of_week=2, start_time="14:00", end_time="15:30", room="LHC-301"),
            TimetableEntry(user_id=users[0].id, course_code="CS302", course_name="Operating Systems",
                           instructor="Dr. Priya Singh", day_of_week=3, start_time="10:00", end_time="11:00", room="LHC-204"),
            TimetableEntry(user_id=users[0].id, course_code="HS301", course_name="Technical Communication",
                           instructor="Dr. Kavita Mehta", day_of_week=4, start_time="11:00", end_time="12:00", room="LHC-102"),
        ]
        db.add_all(tt_entries)

        # ---- assignments ----
        assignments = [
            Assignment(instructor_id=users[4].id, course_code="CS301",
                       title="Assignment 2: Binary Search Trees",
                       description="Implement AVL tree insertion and deletion. Submit code + analysis document.",
                       due_date=datetime.now() + timedelta(days=7), max_marks=50),
            Assignment(instructor_id=users[4].id, course_code="CS301",
                       title="Lab 4: Graph Traversals",
                       description="Implement BFS and DFS with adjacency list representation. Include time complexity analysis.",
                       due_date=datetime.now() + timedelta(days=3), max_marks=30),
        ]
        db.add_all(assignments)

        # ---- pre-loaded mails for demo ----
        mails = [
            MailItem(user_id=users[0].id, subject="Midterm Examination Schedule - Even Semester 2026",
                     sender="academics@iitrpr.ac.in",
                     body="Dear Students, This is to inform you that the midterm examinations for the even semester 2025-26 will be conducted from 15th March to 22nd March 2026. The detailed schedule with room allotments will be shared by 10th March. Students must carry their ID cards to the examination hall. Any student found without an ID card will not be allowed to take the exam. Contact the Academic Section for queries. Ensure you have registered for all courses by 28th February.",
                     summary="Midterm exams scheduled from 15-22 March 2026. Detailed schedule by 10th March. Carry ID cards mandatory.",
                     category=MailCategory.academic, priority_score=0.8,
                     action_items='["Ensure course registration by 28th February", "Carry ID card to examination hall"]',
                     deadline="15 March 2026"),
            MailItem(user_id=users[0].id, subject="Advitiya 2026 - Volunteer Registration Open",
                     sender="culturals@iitrpr.ac.in",
                     body="Hey everyone! Advitiya 2026 is around the corner and we are looking for enthusiastic volunteers to help make this fest a grand success. Registration is open till 20th February. We need volunteers for event management, hospitality, publicity, and technical operations. Register on the Advitiya portal. This is a great opportunity to earn volunteer hours and get exclusive fest merchandise. Contact the cultural secretary for more details.",
                     summary="Advitiya 2026 volunteer registration open till 20th February. Roles in event management, hospitality, publicity, tech ops.",
                     category=MailCategory.event, priority_score=0.4,
                     action_items='["Register as volunteer on Advitiya portal by 20th February"]',
                     deadline="20 February 2026"),
            MailItem(user_id=users[0].id, subject="URGENT: Hostel Maintenance - Water Supply Disruption",
                     sender="hostel@iitrpr.ac.in",
                     body="Due to maintenance work on the main water pipeline, there will be no water supply in Hostels A, B, and C from 10 PM tonight to 6 AM tomorrow morning. Students are advised to store sufficient water beforehand. We apologize for the inconvenience. Normal supply will resume by 6 AM. For emergencies, contact the hostel warden.",
                     summary="Water supply disruption tonight 10 PM to 6 AM in Hostels A, B, C due to pipeline maintenance. Store water.",
                     category=MailCategory.urgent, priority_score=0.95,
                     action_items='["Store sufficient water before 10 PM tonight"]',
                     deadline=""),
        ]
        db.add_all(mails)

        await db.commit()
        print("Database seeded with sample data.")


if __name__ == "__main__":
    asyncio.run(seed())

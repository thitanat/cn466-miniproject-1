# cn466-miniproject-1

## เป้าหมายและรายละเอียดโครงงาน

Repository นี้เป็นส่วนหนึ่งของรายวิชา CN466 Internet of Things ปีการศึกษา 2565 ตามหลักสูตรวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์

### เป้าหมาย

เป้าหมายของการจัดทำโครงงานนี้เพื่อนำข้อมูลจาก IoT Sensor (ESP32-S2) ไปแสดงผลให้ดูเข้าถึงได้ง่ายขึ้นในกลุ่มผู้ใช้ต่างๆ โดยอาศัย LINE ที่เป็นแอปพลิเคชันสำหรับติดต่อสื่อสารระหว่างกันที่มีผู้ใช้เป็นจำนวนมาก ในการแสดงข้อมูลดังกล่าว โดย Software ที่ใช้ทำต่างๆ จะประกอบไปด้วย Docker ที่มี MongoDB กับ NodeJS เป็นส่วนประกอบรวมกันเป็น Container โดย Container จะใช้เป็น Server ของ LINE Bot ส่วนข้อมูลจาก IoT Sensor จะพัฒนาโดยใช้ PlatformIO ของ VSCode ในการเรียกข้อมูลจาก IoT Sensor เพื่อส่งข้อมูลขึ้นไปยัง HiveMQ Broker ไว้สำหรับการที่ Server และ LIFF ของ LINE Bot จะติดตามข้อมูลของ IoT Sensor 

### ความคาดหวัง

ความคาดหวังของโครงงานนี้คือ LINE Bot นี้จะสามารถส่งข้อมูลและแสดงข้อมูลจาก Sensor ไปหาผู้ใช้ที่สอบถามได้

## รายชื่อสมาชิกในกลุ่มและเนื้องานที่ได้ทำ

1. ณัฐพงศ์ เชาวเจริญพงศ์ 6110520134 รับผิดชอบในส่วนของ IoT และ HiveMQ Broker
2. ชื่นชนก ผิวเกลี้ยง 6110613111 รับผิดชอบในส่วนของ Github Page ที่ใช้สำหรับ LIFF ในการแสดงข้อมูลที่ได้จาก HiveMQ Broker
3. ฐิตณัฐ ณ สงขลา 6110613210 รับผิดชอบในส่วนของ Server ที่ใช้ในการรับ-ส่งข้อมูลจาก HiveMQ Broker
4. ปุญญ์ฐิสา แตงมั่ง 6110613236 รับผิดชอบในส่วนของการจัดการ LINE Bot และ Rich Menu ของ LINE Bot

## ภาพรวมของโครงงาน

![Channel Massaging API](/example/image.png)
Channel Massaging API

![Massage1](/Example/1.png)
![Massage2](/Example/2.png)
![Massage3](/Example/3.png)
![Massage3](/Example/4.png)
ตัวอย่างแชทระหว่างผู้ใช้กับ LINE Bot

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <Adafruit_HTS221.h>
#include <WiFi.h>
#include <WiFiManager.h>
#include <WiFiClientSecure.h>
#include <WiFiClient.h>
#include <PubSubClient.h>

#define TRIGGER_PIN 0

Adafruit_BMP280 bmp;
Adafruit_HTS221 hts;
struct tm timeinfo;
WiFiClient wifiClient;
WiFiManager wifiManager;
PubSubClient mqttClient(wifiClient);
char *mqttServer = "broker.hivemq.com";
int mqttPort = 1883;
long lastMsg = 0;

void setClock()
{
  configTime(0, 0, "pool.ntp.org");

  Serial.print(F("Waiting for NTP time sync: "));
  time_t nowSecs = time(nullptr);
  while (nowSecs < 8 * 3600 * 2)
  {
    delay(500);
    Serial.print(F("."));
    yield();
    nowSecs = time(nullptr);
  }

  Serial.println();
  gmtime_r(&nowSecs, &timeinfo);
  Serial.print(F("Current time: "));
  Serial.print(asctime(&timeinfo));
}

void callback(char *topic, byte *payload, unsigned int length)
{
  Serial.print("Callback - ");
  Serial.print("Message:");
  for (int i = 0; i < length; i++)
  {
    Serial.print((char)payload[i]);
  }
}

void setupMQTT()
{
  mqttClient.setServer(mqttServer, mqttPort);
  // set the callback function
  mqttClient.setCallback(callback);
  mqttClient.connect("ESP32Client");
}

void reconnect()
{
  // Loop until we're reconnected
  while (!mqttClient.connected())
  {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (mqttClient.connect("ESP32Client"))
    {
      Serial.println("connected");
      // Subscribe
      mqttClient.subscribe("cn466/cucumber_4/sensor");
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup()
{
  Wire.begin(41, 40, (int64_t)100000);
  WiFi.mode(WIFI_AP_STA);
  Serial.begin(115200);

  if (bmp.begin(0x76))
  { // prepare BMP280 sensor
    Serial.println("BMP280 sensor ready");
  }
  if (hts.begin_I2C())
  { // prepare HTS221 sensor
    Serial.println("HTS221 sensor ready");
  }

  bool res;
  // res = wm.autoConnect(); // auto generated AP name from chipid
  // res = wm.autoConnect("AutoConnectAP"); // anonymous ap
  // wifiManager.resetSettings();
  res = wifiManager.autoConnect("AutoConnectAP", "password"); // password protected ap

  if (!res)
  {
    Serial.println("Failed to connect");
    // ESP.restart();
  }
  else
  {
    // if you get here you have connected to the WiFi
    Serial.println("connected...yeey :)");
  }

  pinMode(2, OUTPUT); // prepare LED
  digitalWrite(2, LOW);

  setClock();
  setupMQTT();
}

void loop()
{
  // put your main code here, to run repeatedly:

  if (!mqttClient.connected())
  {
    reconnect();
  }
  mqttClient.loop();

  long now = millis();
  if (now - lastMsg > 5000)
  {
    lastMsg = now;

    char json_body[200];
    const char json_tmpl[] = "{\"pressure\": %.2f,"
                             "\"temperature\": %.2f,"
                             "\"humidity\": %.2f}";
    sensors_event_t temp, humid;
    float pressure = bmp.readPressure();
    hts.getEvent(&humid, &temp);
    float temperature = temp.temperature;
    float humidity = humid.relative_humidity;
    sprintf(json_body, json_tmpl, pressure, temperature, humidity);
    Serial.println(json_body);
    mqttClient.publish("cn466/cucumber_4/sensor", json_body);
  }
}

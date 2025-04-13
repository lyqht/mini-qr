<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  generateTextData,
  generateUrlData,
  generateEmailData,
  generatePhoneData,
  generateSmsData,
  generateWifiData,
  generateVCardData,
  generateLocationData,
  generateEventData
} from '../utils/dataEncoding'

const { t } = useI18n()

const showModal = ref(false)
const selectedType = ref('text')

// Text refs
const textData = ref('')

// URL refs
const urlData = ref('')

// Email refs
const emailAddress = ref('')
const emailSubject = ref('')
const emailBody = ref('')

// Phone refs
const phoneNumber = ref('')

// SMS refs
const smsNumber = ref('')
const smsMessage = ref('')

// WiFi refs
const wifiSSID = ref('')
const wifiPassword = ref('')
const wifiEncryption = ref('nopass')
const wifiHidden = ref(false)

// vCard refs
const vcardFirstName = ref('')
const vcardLastName = ref('')
const vcardOrg = ref('')
const vcardPosition = ref('')
const vcardPhoneWork = ref('')
const vcardPhonePrivate = ref('')
const vcardPhoneMobile = ref('')
const vcardEmail = ref('')
const vcardWebsite = ref('')
const vcardStreet = ref('')
const vcardZipcode = ref('')
const vcardCity = ref('')
const vcardState = ref('')
const vcardCountry = ref('')

// Location refs
const locationLatitude = ref<number | string>('')
const locationLongitude = ref<number | string>('')

// Event refs
const eventTitle = ref('')
const eventLocation = ref('')
const eventStartTime = ref('')
const eventEndTime = ref('')

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:data', 'close'])

watch(
  () => props.show,
  (newValue: boolean) => {
    showModal.value = newValue
  }
)

const generateDataString = () => {
  let generatedString = ''
  switch (selectedType.value) {
    case 'text':
      generatedString = generateTextData({ text: textData.value })
      break
    case 'url':
      generatedString = generateUrlData({ url: urlData.value })
      break
    case 'email':
      generatedString = generateEmailData({
        address: emailAddress.value,
        subject: emailSubject.value,
        body: emailBody.value
      })
      break
    case 'phone':
      generatedString = generatePhoneData({ phone: phoneNumber.value })
      break
    case 'sms':
      generatedString = generateSmsData({ phone: smsNumber.value, message: smsMessage.value })
      break
    case 'wifi':
      generatedString = generateWifiData({
        ssid: wifiSSID.value,
        password: wifiPassword.value,
        encryption: wifiEncryption.value as 'nopass' | 'WEP' | 'WPA', // Type assertion
        hidden: wifiHidden.value
      })
      break
    case 'vcard':
      generatedString = generateVCardData({
        firstName: vcardFirstName.value,
        lastName: vcardLastName.value,
        org: vcardOrg.value,
        position: vcardPosition.value,
        phoneWork: vcardPhoneWork.value,
        phonePrivate: vcardPhonePrivate.value,
        phoneMobile: vcardPhoneMobile.value,
        email: vcardEmail.value,
        website: vcardWebsite.value,
        street: vcardStreet.value,
        zipcode: vcardZipcode.value,
        city: vcardCity.value,
        state: vcardState.value,
        country: vcardCountry.value
      })
      break
    // Removed mecard case
    case 'location':
      generatedString = generateLocationData({
        latitude: locationLatitude.value,
        longitude: locationLongitude.value
      })
      break
    case 'event': // Added event case
      generatedString = generateEventData({
        title: eventTitle.value,
        location: eventLocation.value,
        startTime: eventStartTime.value,
        endTime: eventEndTime.value
      })
      break
    default:
      generatedString = ''
  }
  emit('update:data', generatedString)
  closeModal()
}

const fillWithExampleData = () => {
  const now = new Date()
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
  // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
  const formatForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  switch (selectedType.value) {
    case 'text':
      textData.value = 'Have a wonderful day!'
      break
    case 'url':
      urlData.value = 'https://github.com/lyqht/mini-qr'
      break
    case 'email':
      emailAddress.value = 'test@example.com'
      emailSubject.value = 'QR Code Test'
      emailBody.value = 'This is a test email from MiniQR!'
      break
    case 'phone':
      phoneNumber.value = '+19876543210'
      break
    case 'sms':
      smsNumber.value = '+19876543210'
      smsMessage.value = 'Hello from MiniQR!'
      break
    case 'wifi':
      wifiSSID.value = 'MyWiFiNetwork'
      wifiEncryption.value = 'WPA'
      wifiPassword.value = 'Password123'
      wifiHidden.value = false
      break
    case 'vcard':
      vcardFirstName.value = 'Jane'
      vcardLastName.value = 'Smith'
      vcardOrg.value = 'Example Inc.'
      vcardPosition.value = 'Developer'
      vcardPhoneWork.value = '+1-555-000-1111'
      vcardPhonePrivate.value = ''
      vcardPhoneMobile.value = '+1-555-222-3333'
      vcardEmail.value = 'jane.smith@example.com'
      vcardWebsite.value = 'https://example.com'
      vcardStreet.value = '456 Example Ave'
      vcardCity.value = 'Othertown'
      vcardState.value = 'NY'
      vcardZipcode.value = '10001'
      vcardCountry.value = 'USA'
      break
    case 'location':
      locationLatitude.value = '37.7749'
      locationLongitude.value = '-122.4194' // San Francisco
      break
    case 'event':
      eventTitle.value = 'Project Sync'
      eventLocation.value = 'Online'
      eventStartTime.value = formatForInput(now)
      eventEndTime.value = formatForInput(oneHourLater)
      break
    // No example required for 'text' type... right? xD
  }
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <div
    class="modal-overlay fixed inset-0 z-[1000] flex items-center justify-center bg-black/40"
    v-if="showModal"
    @click.self="closeModal"
  >
    <div
      class="modal-content card relative flex w-[90%] max-w-[650px] flex-col rounded-lg bg-white p-6 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
      style="max-height: 85vh"
    >
      <div class="absolute right-6 top-6 z-10">
        <button @click="fillWithExampleData" class="button">{{ t('Use Example') }}</button>
      </div>

      <h2 class="mb-4 text-xl font-semibold">{{ t('Data to encode') }}</h2>

      <div class="flex flex-col gap-1">
        <label for="dataType" class="label">{{ t('Data type') }}</label>
        <select id="dataType" v-model="selectedType" class="mb-4 text-input">
          <option value="text">{{ t('Text') }}</option>
          <option value="url">{{ t('URL') }}</option>
          <option value="email">{{ t('Email') }}</option>
          <option value="phone">{{ t('Phone') }}</option>
          <option value="sms">{{ t('SMS') }}</option>
          <option value="wifi">{{ t('WiFi') }}</option>
          <option value="vcard">{{ t('vCard') }}</option>
          <option value="location">{{ t('Location') }}</option>
          <option value="event">{{ t('Event') }}</option>
        </select>
      </div>

      <div class="mb-4 grow overflow-y-auto pr-2">
        <div v-if="selectedType === 'text'" class="flex flex-col gap-1">
          <label for="textData" class="label">{{ t('Text') }}</label>
          <textarea
            id="textData"
            v-model="textData"
            class="text-input"
            :placeholder="t('Enter any text here')"
          ></textarea>
        </div>

        <div v-if="selectedType === 'url'" class="flex flex-col gap-1">
          <label for="urlData" class="label">{{ t('URL') }}</label>
          <input
            type="url"
            id="urlData"
            v-model="urlData"
            placeholder="https://example.com"
            class="text-input"
          />
        </div>

        <div v-if="selectedType === 'email'" class="flex flex-col gap-1">
          <label for="emailAddress" class="label">{{ t('Email Address') }}</label>
          <input
            type="email"
            id="emailAddress"
            v-model="emailAddress"
            placeholder="recipient@example.com"
            class="text-input"
          />
          <label for="emailSubject" class="label">{{ t('Subject') }}</label>
          <input
            type="text"
            id="emailSubject"
            v-model="emailSubject"
            :placeholder="t('Optional subject line')"
            class="text-input"
          />
          <label for="emailBody" class="label">{{ t('Message') }}</label>
          <textarea
            id="emailBody"
            v-model="emailBody"
            class="text-input"
            :placeholder="t('Optional email body')"
          ></textarea>
        </div>

        <div v-if="selectedType === 'phone'" class="flex flex-col gap-1">
          <label for="phoneNumber" class="label">{{ t('Phone Number') }}</label>
          <input
            type="tel"
            id="phoneNumber"
            v-model="phoneNumber"
            placeholder="+1234567890"
            class="text-input"
          />
        </div>

        <div v-if="selectedType === 'sms'" class="flex flex-col gap-1">
          <label for="smsNumber" class="label">{{ t('Phone Number') }}</label>
          <input
            type="tel"
            id="smsNumber"
            v-model="smsNumber"
            placeholder="+1234567890"
            class="text-input"
          />
          <label for="smsMessage" class="label">{{ t('Message') }}</label>
          <textarea
            id="smsMessage"
            v-model="smsMessage"
            class="text-input"
            :placeholder="t('Optional SMS message')"
          ></textarea>
        </div>

        <div v-if="selectedType === 'wifi'" class="flex flex-col gap-1">
          <label for="wifiSSID" class="label">{{ t('Wireless SSID') }}</label>
          <input
            type="text"
            id="wifiSSID"
            v-model="wifiSSID"
            :placeholder="t('Your network name')"
            class="text-input"
          />
          <label for="wifiPassword" class="label">{{ t('Password') }}</label>
          <input
            type="password"
            id="wifiPassword"
            v-model="wifiPassword"
            :disabled="wifiEncryption === 'nopass'"
            :placeholder="t('Network password (case-sensitive)')"
            class="text-input"
          />
          <label for="wifiEncryption" class="label">{{ t('Encryption') }}</label>
          <select id="wifiEncryption" v-model="wifiEncryption" class="text-input">
            <option value="nopass">{{ t('No encryption') }}</option>
            <option value="WEP">WEP</option>
            <option value="WPA">WPA/WPA2</option>
          </select>
          <label
            class="label-inline mt-2 inline-flex items-center font-normal text-inherit"
            for="wifiHidden"
          >
            <input type="checkbox" id="wifiHidden" v-model="wifiHidden" class="checkbox" />
            {{ t('Hidden SSID') }}
          </label>
        </div>

        <div
          v-if="selectedType === 'vcard'"
          class="grid grid-cols-1 items-start gap-3 md:grid-cols-2 md:gap-x-4"
        >
          <div>
            <label for="vcardFirstName" class="label">{{ t('First Name') }}</label>
            <input
              type="text"
              id="vcardFirstName"
              v-model="vcardFirstName"
              :placeholder="t('e.g., John')"
              class="text-input"
            />
          </div>
          <div>
            <label for="vcardLastName" class="label">{{ t('Last Name') }}</label>
            <input
              type="text"
              id="vcardLastName"
              v-model="vcardLastName"
              :placeholder="t('e.g., Doe')"
              class="text-input"
            />
          </div>
          <div>
            <label for="vcardOrg" class="label">{{ t('Organization') }}</label>
            <input
              type="text"
              id="vcardOrg"
              v-model="vcardOrg"
              :placeholder="t('e.g., Acme Corp')"
              class="text-input"
            />
          </div>
          <div>
            <label for="vcardPosition" class="label">{{ t('Position') }}</label>
            <input
              type="text"
              id="vcardPosition"
              v-model="vcardPosition"
              :placeholder="t('e.g., Software Engineer')"
              class="text-input"
            />
          </div>
          <div>
            <label for="vcardPhoneWork" class="label">{{ t('Phone (Work)') }}</label>
            <input
              type="tel"
              id="vcardPhoneWork"
              v-model="vcardPhoneWork"
              placeholder="+1-555-123-4567"
              class="text-input"
            />
          </div>
          <div>
            <label for="vcardPhonePrivate" class="label">{{ t('Phone (Private)') }}</label>
            <input
              type="tel"
              id="vcardPhonePrivate"
              v-model="vcardPhonePrivate"
              placeholder="+1-555-987-6543"
              class="text-input"
            />
          </div>
          <div>
            <label for="vcardPhoneMobile" class="label">{{ t('Phone (Mobile)') }}</label>
            <input
              type="tel"
              id="vcardPhoneMobile"
              v-model="vcardPhoneMobile"
              placeholder="+1-555-111-2222"
              class="text-input"
            />
          </div>
          <div>
            <label for="vcardEmail" class="label">{{ t('Email') }}</label>
            <input
              type="email"
              id="vcardEmail"
              v-model="vcardEmail"
              placeholder="john.doe@acme.com"
              class="text-input"
            />
          </div>
          <div>
            <label for="vcardWebsite" class="label">{{ t('Website') }}</label>
            <input
              type="url"
              id="vcardWebsite"
              v-model="vcardWebsite"
              placeholder="https://acme.com"
              class="text-input"
            />
          </div>
          <div>
            <label for="vcardStreet" class="label">{{ t('Street') }}</label>
            <input
              type="text"
              id="vcardStreet"
              v-model="vcardStreet"
              placeholder="123 Main St"
              class="text-input"
            />
          </div>
          <div>
            <label for="vcardZipcode" class="label">{{ t('Zipcode') }}</label>
            <input
              type="text"
              id="vcardZipcode"
              v-model="vcardZipcode"
              placeholder="90210"
              class="text-input"
            />
          </div>
          <div>
            <label for="vcardCity" class="label">{{ t('City') }}</label>
            <input
              type="text"
              id="vcardCity"
              v-model="vcardCity"
              placeholder="Anytown"
              class="text-input"
            />
          </div>
          <div>
            <label for="vcardState" class="label">{{ t('State') }}</label>
            <input
              type="text"
              id="vcardState"
              v-model="vcardState"
              placeholder="CA"
              class="text-input"
            />
          </div>
          <div>
            <label for="vcardCountry" class="label">{{ t('Country') }}</label>
            <input
              type="text"
              id="vcardCountry"
              v-model="vcardCountry"
              placeholder="USA"
              class="text-input"
            />
          </div>
        </div>

        <div v-if="selectedType === 'location'" class="flex flex-col gap-1">
          <label for="locationLatitude" class="label">{{ t('Latitude') }}</label>
          <input
            type="number"
            step="any"
            id="locationLatitude"
            v-model="locationLatitude"
            placeholder="e.g., 40.7128"
            class="text-input"
          />
          <label for="locationLongitude" class="label">{{ t('Longitude') }}</label>
          <input
            type="number"
            step="any"
            id="locationLongitude"
            v-model="locationLongitude"
            placeholder="e.g., -74.0060"
            class="text-input"
          />
        </div>

        <div v-if="selectedType === 'event'" class="flex flex-col gap-1">
          <label for="eventTitle" class="label">{{ t('Event Title') }}</label>
          <input
            type="text"
            id="eventTitle"
            v-model="eventTitle"
            placeholder="e.g., Team Meeting"
            class="text-input"
          />

          <label for="eventLocation" class="label">{{ t('Event Location') }}</label>
          <input
            type="text"
            id="eventLocation"
            v-model="eventLocation"
            placeholder="e.g., Conference Room A"
            class="text-input"
          />

          <label for="eventStartTime" class="label">{{ t('Start Time') }}</label>
          <input
            type="datetime-local"
            id="eventStartTime"
            v-model="eventStartTime"
            class="text-input"
            :placeholder="t('YYYY-MM-DDTHH:MM')"
          />

          <label for="eventEndTime" class="label">{{ t('End Time') }}</label>
          <input
            type="datetime-local"
            id="eventEndTime"
            v-model="eventEndTime"
            class="text-input"
            :placeholder="t('YYYY-MM-DDTHH:MM')"
          />
        </div>
      </div>

      <div
        class="mt-auto flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-zinc-700"
      >
        <button @click="generateDataString" class="button">{{ t('Generate') }}</button>
        <button @click="closeModal" class="secondary-button">{{ t('Close') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type='number'] {
  -moz-appearance: textfield;
}
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>

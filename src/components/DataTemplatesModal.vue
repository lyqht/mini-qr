<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  detectDataType,
  generateEmailData,
  generateEventData,
  generateLocationData,
  generatePhoneData,
  generateSmsData,
  generateTextData,
  generateUrlData,
  generateVCardData,
  generateWifiData
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
const emailCc = ref('')
const emailBcc = ref('')

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
const vcardVersion = ref('2')

// Location refs
const locationLatitude = ref<number | string>('')
const locationLongitude = ref<number | string>('')

// Event refs
const eventTitle = ref('')
const eventLocation = ref('')
const eventStartTime = ref('')
const eventEndTime = ref('')

// Add validation state
const invalidFields = ref<string[]>([])
const formSubmitted = ref(false)

const props = defineProps<{
  show: boolean
  initialData?: string
}>()

const emit = defineEmits(['update:data', 'close'])

watch(
  () => props.show,
  (newValue: boolean) => {
    showModal.value = newValue
    if (newValue && props.initialData) {
      detectAndSetDataType(props.initialData)
    }
  }
)

// Reset validation when changing type
watch(selectedType, () => {
  invalidFields.value = []
  formSubmitted.value = false
})

// Clear validation errors dynamically when fields are filled
watch(textData, (newValue) => {
  if (newValue && invalidFields.value.includes('textData')) {
    invalidFields.value = invalidFields.value.filter((field) => field !== 'textData')
  }
})

watch(urlData, (newValue) => {
  if (newValue && invalidFields.value.includes('urlData')) {
    invalidFields.value = invalidFields.value.filter((field) => field !== 'urlData')
  }
})

watch(emailAddress, (newValue) => {
  if (newValue && invalidFields.value.includes('emailAddress')) {
    invalidFields.value = invalidFields.value.filter((field) => field !== 'emailAddress')
  }
})

watch(phoneNumber, (newValue) => {
  if (newValue && invalidFields.value.includes('phoneNumber')) {
    invalidFields.value = invalidFields.value.filter((field) => field !== 'phoneNumber')
  }
})

watch(smsNumber, (newValue) => {
  if (newValue && invalidFields.value.includes('smsNumber')) {
    invalidFields.value = invalidFields.value.filter((field) => field !== 'smsNumber')
  }
})

watch(wifiSSID, (newValue) => {
  if (newValue && invalidFields.value.includes('wifiSSID')) {
    invalidFields.value = invalidFields.value.filter((field) => field !== 'wifiSSID')
  }
})

watch(locationLatitude, (newValue) => {
  if (newValue && invalidFields.value.includes('locationLatitude')) {
    invalidFields.value = invalidFields.value.filter((field) => field !== 'locationLatitude')
  }
})

watch(locationLongitude, (newValue) => {
  if (newValue && invalidFields.value.includes('locationLongitude')) {
    invalidFields.value = invalidFields.value.filter((field) => field !== 'locationLongitude')
  }
})

watch(eventTitle, (newValue) => {
  if (newValue && invalidFields.value.includes('eventTitle')) {
    invalidFields.value = invalidFields.value.filter((field) => field !== 'eventTitle')
  }
})

watch(eventStartTime, (newValue) => {
  if (newValue && invalidFields.value.includes('eventStartTime')) {
    invalidFields.value = invalidFields.value.filter((field) => field !== 'eventStartTime')
  }
})

watch(eventEndTime, (newValue) => {
  if (newValue && invalidFields.value.includes('eventEndTime')) {
    invalidFields.value = invalidFields.value.filter((field) => field !== 'eventEndTime')
  }
})

// Use imported detectDataType to populate form fields
const detectAndSetDataType = (data: string) => {
  const result = detectDataType(data)

  // Set form type
  selectedType.value = result.type

  // Populate fields based on detected type
  switch (result.type) {
    case 'text':
      textData.value = (result.parsedData.text as string) || ''
      break

    case 'url':
      urlData.value = (result.parsedData.url as string) || ''
      break

    case 'email':
      emailAddress.value = (result.parsedData.address as string) || ''
      emailSubject.value = (result.parsedData.subject as string) || ''
      emailBody.value = (result.parsedData.body as string) || ''
      emailCc.value = (result.parsedData.cc as string) || ''
      emailBcc.value = (result.parsedData.bcc as string) || ''
      break

    case 'phone':
      phoneNumber.value = (result.parsedData.phone as string) || ''
      break

    case 'sms':
      smsNumber.value = (result.parsedData.phone as string) || ''
      smsMessage.value = (result.parsedData.message as string) || ''
      break

    case 'wifi':
      wifiSSID.value = (result.parsedData.ssid as string) || ''
      wifiEncryption.value = (result.parsedData.encryption as 'nopass' | 'WEP' | 'WPA') || 'nopass'
      wifiPassword.value = (result.parsedData.password as string) || ''
      wifiHidden.value = Boolean(result.parsedData.hidden)
      break

    case 'vcard':
      vcardFirstName.value = (result.parsedData.firstName as string) || ''
      vcardLastName.value = (result.parsedData.lastName as string) || ''
      vcardOrg.value = (result.parsedData.org as string) || ''
      vcardPosition.value = (result.parsedData.position as string) || ''
      vcardPhoneWork.value = (result.parsedData.phoneWork as string) || ''
      vcardPhonePrivate.value = (result.parsedData.phonePrivate as string) || ''
      vcardPhoneMobile.value = (result.parsedData.phoneMobile as string) || ''
      vcardEmail.value = (result.parsedData.email as string) || ''
      vcardWebsite.value = (result.parsedData.website as string) || ''
      vcardStreet.value = (result.parsedData.street as string) || ''
      vcardCity.value = (result.parsedData.city as string) || ''
      vcardState.value = (result.parsedData.state as string) || ''
      vcardZipcode.value = (result.parsedData.zipcode as string) || ''
      vcardCountry.value = (result.parsedData.country as string) || ''
      vcardVersion.value = (result.parsedData.version as string) || '3'
      break

    case 'location':
      locationLatitude.value = (result.parsedData.latitude as string) || ''
      locationLongitude.value = (result.parsedData.longitude as string) || ''
      break

    case 'event':
      eventTitle.value = (result.parsedData.title as string) || ''
      eventLocation.value = (result.parsedData.location as string) || ''
      eventStartTime.value = (result.parsedData.startTime as string) || ''
      eventEndTime.value = (result.parsedData.endTime as string) || ''
      break
  }
}

const validateForm = () => {
  formSubmitted.value = true
  invalidFields.value = []
  let isValid = true

  // Validate fields based on the selected type
  switch (selectedType.value) {
    case 'text':
      if (!textData.value) {
        invalidFields.value.push('textData')
        isValid = false
      }
      break
    case 'url':
      if (!urlData.value) {
        invalidFields.value.push('urlData')
        isValid = false
      }
      break
    case 'email':
      if (!emailAddress.value) {
        invalidFields.value.push('emailAddress')
        isValid = false
      }
      break
    case 'phone':
      if (!phoneNumber.value) {
        invalidFields.value.push('phoneNumber')
        isValid = false
      }
      break
    case 'sms':
      if (!smsNumber.value) {
        invalidFields.value.push('smsNumber')
        isValid = false
      }
      break
    case 'wifi':
      if (!wifiSSID.value) {
        invalidFields.value.push('wifiSSID')
        isValid = false
      }
      if (wifiEncryption.value.toLowerCase() !== 'nopass' && !wifiPassword.value) {
        invalidFields.value.push('wifiPassword')
        isValid = false
      }
      break
    case 'location':
      if (!locationLatitude.value) {
        invalidFields.value.push('locationLatitude')
        isValid = false
      }
      if (!locationLongitude.value) {
        invalidFields.value.push('locationLongitude')
        isValid = false
      }
      break
    case 'event':
      if (!eventTitle.value) {
        invalidFields.value.push('eventTitle')
        isValid = false
      }
      if (!eventStartTime.value) {
        invalidFields.value.push('eventStartTime')
        isValid = false
      }
      if (!eventEndTime.value) {
        invalidFields.value.push('eventEndTime')
        isValid = false
      }
      break
  }

  return isValid
}

const isFieldInvalid = (fieldName: string) => {
  return formSubmitted.value && invalidFields.value.includes(fieldName)
}

const generateDataString = () => {
  if (!validateForm()) {
    // Form is invalid, don't proceed
    return
  }

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
        body: emailBody.value,
        cc: emailCc.value,
        bcc: emailBcc.value
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
        country: vcardCountry.value,
        version: vcardVersion.value
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
      emailCc.value = 'cc@example.com'
      emailBcc.value = 'bcc@example.com'
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
    class="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-black/40 pt-4 shadow-lg md:items-center md:pt-0"
    v-if="showModal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="data-to-encode-modal-title"
    @click.self="closeModal"
  >
    <div
      class="relative mb-4 flex min-h-[200px] w-[90%] max-w-full flex-col rounded-lg bg-white p-8 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 md:mb-0 md:max-h-[85vh] md:max-w-[650px]"
    >
      <!-- Header -->
      <div class="-m-4 grid grid-cols-[auto_1fr_auto] items-center pb-8 md:grid-cols-3 md:pb-16">
        <button :aria-label="t('Close dialog')" @click="closeModal" class="button place-self-start">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M18 6L6 18M6 6l12 12"
            />
          </svg>
        </button>
        <h2 id="data-to-encode-modal-title" class="px-2 text-center text-xl font-semibold">
          {{ t('Data to encode') }}
        </h2>
        <button
          @click="fillWithExampleData"
          class="secondary-button place-self-start justify-self-end"
        >
          <span class="hidden md:inline">{{ t('Use example') }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            class="md:hidden"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M8 10h8m-8 4h6m4-9H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z"
            />
          </svg>
        </button>
      </div>

      <!-- data type select -->
      <div class="flex flex-col gap-1 pe-4">
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

      <div class="grid place-items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <!-- Icon from Myna UI Icons by Praveen Juge - https://github.com/praveenjuge/mynaui-icons/blob/main/LICENSE -->
          <path
            fill="none"
            stroke="#888888"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="m6 6l6 6l6-6M6 12l6 6l6-6"
          />
        </svg>
      </div>

      <!-- data type specific inputs -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden py-4 pe-4 text-start">
        <!-- Required field indicator for reuse -->
        <span class="sr-only">{{ t('Required fields are marked with an asterisk (*)') }}</span>

        <div v-if="selectedType === 'text'" class="flex flex-col gap-4">
          <label for="textData" class="label">
            {{ t('Text') }} <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea
            id="textData"
            v-model="textData"
            class="text-input"
            :class="{
              'border-red-500 focus:border-red-500 focus:ring-red-500': isFieldInvalid('textData')
            }"
            :placeholder="t('Have a beautiful day!')"
            required
            aria-required="true"
          ></textarea>
          <p v-if="isFieldInvalid('textData')" class="mt-1 text-sm text-red-500">
            {{ t('Text is required') }}
          </p>
        </div>

        <div v-if="selectedType === 'url'" class="flex flex-col gap-4">
          <label for="urlData" class="label">
            {{ t('URL') }} <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            type="url"
            id="urlData"
            v-model="urlData"
            placeholder="https://example.com"
            class="text-input"
            :class="{
              'border-red-500 focus:border-red-500 focus:ring-red-500': isFieldInvalid('urlData')
            }"
            required
            aria-required="true"
          />
          <p v-if="isFieldInvalid('urlData')" class="mt-1 text-sm text-red-500">
            {{ t('URL is required') }}
          </p>
        </div>

        <div v-if="selectedType === 'email'" class="flex flex-col gap-4">
          <label for="emailAddress" class="label">
            {{ t('Email Address') }} <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            type="email"
            id="emailAddress"
            v-model="emailAddress"
            placeholder="recipient@example.com"
            class="text-input"
            :class="{
              'border-red-500 focus:border-red-500 focus:ring-red-500':
                isFieldInvalid('emailAddress')
            }"
            required
            aria-required="true"
          />
          <p v-if="isFieldInvalid('emailAddress')" class="mt-1 text-sm text-red-500">
            {{ t('Email address is required') }}
          </p>
          <label for="emailCc" class="label sr-only">{{ t('CC') }}</label>
          <input
            type="email"
            id="emailCc"
            v-model="emailCc"
            :placeholder="t('Optional CC')"
            class="text-input"
          />
          <label for="emailBcc" class="label sr-only">{{ t('BCC') }}</label>
          <input
            type="email"
            id="emailBcc"
            v-model="emailBcc"
            :placeholder="t('Optional BCC')"
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

        <div v-if="selectedType === 'phone'" class="flex flex-col gap-4">
          <label for="phoneNumber" class="label">
            {{ t('Phone Number') }} <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            type="tel"
            id="phoneNumber"
            v-model="phoneNumber"
            placeholder="+1234567890"
            class="text-input"
            :class="{
              'border-red-500 focus:border-red-500 focus:ring-red-500':
                isFieldInvalid('phoneNumber')
            }"
            required
            aria-required="true"
          />
          <p v-if="isFieldInvalid('phoneNumber')" class="mt-1 text-sm text-red-500">
            {{ t('Phone number is required') }}
          </p>
        </div>

        <div v-if="selectedType === 'sms'" class="flex flex-col gap-4">
          <label for="smsNumber" class="label">
            {{ t('Phone Number') }} <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            type="tel"
            id="smsNumber"
            v-model="smsNumber"
            placeholder="+1234567890"
            class="text-input"
            :class="{
              'border-red-500 focus:border-red-500 focus:ring-red-500': isFieldInvalid('smsNumber')
            }"
            required
            aria-required="true"
          />
          <p v-if="isFieldInvalid('smsNumber')" class="mt-1 text-sm text-red-500">
            {{ t('Phone number is required') }}
          </p>
          <label for="smsMessage" class="label">{{ t('Message') }}</label>
          <textarea
            id="smsMessage"
            v-model="smsMessage"
            class="text-input"
            rows="3"
            :placeholder="t('Optional SMS message')"
          ></textarea>
        </div>

        <div v-if="selectedType === 'wifi'" class="flex flex-col gap-4">
          <label for="wifiEncryption" class="label">{{ t('Encryption') }}</label>
          <select id="wifiEncryption" v-model="wifiEncryption" class="text-input">
            <option value="nopass">{{ t('No encryption') }}</option>
            <option value="WEP">WEP</option>
            <option value="WPA">WPA/WPA2</option>
          </select>

          <label for="wifiSSID" class="label">
            {{ t('Wireless SSID') }} <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="wifiSSID"
            v-model="wifiSSID"
            :placeholder="t('Your network name')"
            class="text-input"
            :class="{
              'border-red-500 focus:border-red-500 focus:ring-red-500': isFieldInvalid('wifiSSID')
            }"
            required
            aria-required="true"
          />
          <p v-if="isFieldInvalid('wifiSSID')" class="mt-1 text-sm text-red-500">
            {{ t('Wireless SSID is required') }}
          </p>

          <label for="wifiPassword" class="label">
            {{ t('Password') }}
            <span
              v-if="wifiEncryption.toLowerCase() !== 'nopass'"
              class="text-red-500"
              aria-hidden="true"
              >*</span
            >
          </label>
          <input
            type="password"
            id="wifiPassword"
            v-model="wifiPassword"
            :disabled="wifiEncryption.toLowerCase() === 'nopass'"
            :required="wifiEncryption.toLowerCase() !== 'nopass'"
            :aria-required="wifiEncryption.toLowerCase() !== 'nopass'"
            :placeholder="t('Network password (case-sensitive)')"
            class="text-input"
            :class="{
              'border-red-500 focus:border-red-500 focus:ring-red-500':
                isFieldInvalid('wifiPassword')
            }"
          />
          <p v-if="isFieldInvalid('wifiPassword')" class="mt-1 text-sm text-red-500">
            {{ t('Password is required when encryption is enabled') }}
          </p>
          <div class="flex w-fit flex-row items-center justify-center gap-2">
            <label for="wifiHidden"> {{ t('Hidden SSID') }}</label>
            <input type="checkbox" id="wifiHidden" v-model="wifiHidden" class="shrink-0" />
          </div>
        </div>

        <div
          v-if="selectedType === 'vcard'"
          class="grid grid-cols-1 items-start gap-3 gap-y-4 md:grid-cols-2 md:gap-x-4"
        >
          <div class="md:col-span-2">
            <label for="vcardVersion" class="label">{{ t('vCard Version') }}</label>
            <select id="vcardVersion" v-model="vcardVersion" class="text-input">
              <option value="2">vCard 2.1</option>
              <option value="3">vCard 3.0</option>
              <option value="4">vCard 4.0</option>
            </select>
          </div>
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

        <div v-if="selectedType === 'location'" class="flex flex-col gap-4">
          <label for="locationLatitude" class="label">
            {{ t('Latitude') }} <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            type="number"
            step="any"
            id="locationLatitude"
            v-model="locationLatitude"
            placeholder="e.g., 40.7128"
            class="text-input"
            :class="{
              'border-red-500 focus:border-red-500 focus:ring-red-500':
                isFieldInvalid('locationLatitude')
            }"
            required
            aria-required="true"
          />
          <p v-if="isFieldInvalid('locationLatitude')" class="mt-1 text-sm text-red-500">
            {{ t('Latitude is required') }}
          </p>
          <label for="locationLongitude" class="label">
            {{ t('Longitude') }} <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            type="number"
            step="any"
            id="locationLongitude"
            v-model="locationLongitude"
            placeholder="e.g., -74.0060"
            class="text-input"
            :class="{
              'border-red-500 focus:border-red-500 focus:ring-red-500':
                isFieldInvalid('locationLongitude')
            }"
            required
            aria-required="true"
          />
          <p v-if="isFieldInvalid('locationLongitude')" class="mt-1 text-sm text-red-500">
            {{ t('Longitude is required') }}
          </p>
        </div>

        <div v-if="selectedType === 'event'" class="flex flex-col gap-4">
          <label for="eventTitle" class="label">
            {{ t('Event Title') }} <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="eventTitle"
            v-model="eventTitle"
            placeholder="e.g., Team Meeting"
            class="text-input"
            :class="{
              'border-red-500 focus:border-red-500 focus:ring-red-500': isFieldInvalid('eventTitle')
            }"
            required
            aria-required="true"
          />
          <p v-if="isFieldInvalid('eventTitle')" class="mt-1 text-sm text-red-500">
            {{ t('Event title is required') }}
          </p>

          <label for="eventLocation" class="label">{{ t('Event Location') }}</label>
          <input
            type="text"
            id="eventLocation"
            v-model="eventLocation"
            placeholder="e.g., Conference Room A"
            class="text-input"
          />

          <label for="eventStartTime" class="label">
            {{ t('Start Time') }} <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            type="datetime-local"
            id="eventStartTime"
            v-model="eventStartTime"
            class="text-input"
            :class="{
              'border-red-500 focus:border-red-500 focus:ring-red-500':
                isFieldInvalid('eventStartTime')
            }"
            :placeholder="'YYYY-MM-DDTHH:MM'"
            required
            aria-required="true"
          />
          <p v-if="isFieldInvalid('eventStartTime')" class="mt-1 text-sm text-red-500">
            {{ t('Start time is required') }}
          </p>

          <label for="eventEndTime" class="label">
            {{ t('End Time') }} <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            type="datetime-local"
            id="eventEndTime"
            v-model="eventEndTime"
            class="text-input"
            :class="{
              'border-red-500 focus:border-red-500 focus:ring-red-500':
                isFieldInvalid('eventEndTime')
            }"
            :placeholder="t('YYYY-MM-DDTHH:MM')"
            required
            aria-required="true"
          />
          <p v-if="isFieldInvalid('eventEndTime')" class="mt-1 text-sm text-red-500">
            {{ t('End time is required') }}
          </p>
        </div>
      </div>

      <div class="mt-4 flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-zinc-700">
        <button @click="generateDataString" class="button">{{ t('Save') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.border-red-500 {
  animation: shake 0.2s ease-in-out 0s 2;
}

@keyframes shake {
  0% {
    margin-left: 0rem;
  }
  25% {
    margin-left: 0.25rem;
  }
  75% {
    margin-left: -0.25rem;
  }
  100% {
    margin-left: 0rem;
  }
}
</style>

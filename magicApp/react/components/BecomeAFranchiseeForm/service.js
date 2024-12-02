import axios from 'axios'

export const sendDataRequest = async (formData) => {
  const requestData = {
    ...formData,
    acceptTerms: true,
  }

  const response = await axios.patch(
    '/api/dataentities/FR/documents/',
    requestData
  )

  return response.data
}

export const saveDataRequestFile = async (documentId, file) => {
  const formData = new FormData()

  formData.append('file', file)

  await axios.post(
    `/api/dataentities/FD/documents/${documentId}/identidade/attachments`,
    formData,
    {
      headers: {
        Accept: 'application/vnd.vtex.ds.v10+json',
        'Content-Type': 'multipart/form-data',
      },
    }
  )
}

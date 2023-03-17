/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import {getByTestId, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import Bills from '../containers/Bills.js';
import store from '../__mocks__/store.js';

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.className).toEqual("active-icon")

    })

    test("Then bills should be ordered from earliest to latest", () => {

      document.body.innerHTML = BillsUI({ data: bills })
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
      
    })

    describe('When I clic on btn "New bill"', () => {
      test("should display the new bill form", () => {
  
        const bill = [{...bills[0]}]
  
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
  
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employe'
        }))
  
        const newBill = new Bills({
          document, onNavigate, store: null, bills:bill, localStorage: window.localStorage
        })
  
        document.body.innerHTML = BillsUI({ data: bill })
  
        const btnNewBill = getByTestId(document.body, 'btn-new-bill')
  
        const handleClickNewBill = jest.fn((e) => newBill.handleClickNewBill())
  
        btnNewBill.addEventListener('click', handleClickNewBill)
        userEvent.click(btnNewBill)
        
        expect(handleClickNewBill).toHaveBeenCalled()

        const formNewBill = getByTestId(document.body, 'form-new-bill')
        expect(formNewBill).toBeDefined()
        
      })
    })
    
    describe('When I clic on the eye icon of a bill', () => {
      test("should display a modal with the picture of the bill", async () => {
  
        const bill = [{...bills[0]}]
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employe'
        }))
        const newBill = new Bills({
          document, onNavigate, store: null, bills:bill, localStorage: window.localStorage
        })
        document.body.innerHTML = BillsUI({ data: bill })

        const eye = getByTestId(document.body, 'icon-eye')
        const handleClickIconEye = jest.fn(() => newBill.handleClickIconEye(eye))
        eye.addEventListener('click', handleClickIconEye)
        userEvent.click(eye)
        expect(handleClickIconEye).toHaveBeenCalled()

        expect(document.body.querySelector('#modaleFile')).toHaveClass('modal fade show')
        expect(document.body.querySelector('#modaleFile').querySelector('.modal-body').innerHTML).not.toBe('')
        
      })
    })

    test("Then bills should be display correctly", async () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employe'
      }))

      const newBill = new Bills({
        document, onNavigate, store: store, bills: bills, localStorage: window.localStorage
      })
      
      //let dataDate
      let dataOne = {}

      await newBill.getBills().then((data) => {
            document.body.innerHTML = BillsUI({ data })
            dataOne = {...data}
          }).catch((error) => {
            return error
          })

      expect(dataOne).not.toStrictEqual({})

      const billsUI = getByTestId(document.body, 'tbody')
      expect(billsUI.innerHTML).not.toStrictEqual('')

      /*const datesUI = screen.getAllByText(/[0-9]{1,2} [A-Z]{1}[a-zéèû]{2}. [0-9]{2}/g).map(a => a.innerHTML)
      const numberOfDates = datesUI.length
      expect(Object.keys(dataOne).length).toStrictEqual(numberOfDates)*/
    })
  })
})

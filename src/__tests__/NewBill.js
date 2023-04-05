/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom/extend-expect";
import { fireEvent, getByLabelText, getByTestId, screen, waitFor } from "@testing-library/dom"
import {localStorageMock} from "../__mocks__/localStorage.js";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { bills }   from "../fixtures/bills.js"
import mockedStore from "../__mocks__/store.js"
import router from "../app/Router.js";

jest.mock("../app/Store.js", () => mockedStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the NewBill form should be displayed", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      
      await waitFor(() => screen.getByText("Envoyer une note de frais"));
      const formData = screen.getAllByTestId("form-new-bill");
      
      expect(formData).toBeTruthy();
    })
  })
  describe("When I am on NewBill Page and I submit the form", () => {
    
    let billForm, expenseTypeInput, datePickerInput, amountInput,
    pctInput, fileInput, fileInputLabel, file, billData, onNavigate, newBill

    beforeAll(() => {

      billData = bills[0];

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employe',
        email : 'employe@test.tld'
      }))

    })

    beforeEach(() => {

      document.body.innerHTML = NewBillUI()

      billForm = screen.getByTestId("form-new-bill");
      expenseTypeInput = screen.getByTestId("expense-type");
      datePickerInput = screen.getByTestId("datepicker");
      amountInput = screen.getByTestId("amount");
      pctInput = screen.getByTestId("pct");
      fileInput = screen.getByTestId("file");
      fileInputLabel = screen.getByLabelText(/Justificatif/i)

      
      onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      newBill = new NewBill({
        document, onNavigate, store: mockedStore, localStorage: window.localStorage
      })

      billForm.addEventListener("submit", newBill.handleSubmit);
      fileInput.addEventListener("change", newBill.handleChangeFile)

    });

    afterEach(() => {

      document.body.innerHTML = ''

    })
    
    test("Then clean field file if uplaod a bad file", () =>{

        file = new File(['test'], 'C:\fakepath\badFile.pdf', {type: 'application/pdf'})
        userEvent.upload(fileInput, file)
        expect(fileInput.value).toBeFalsy()

    })
    
    test("Then no error should be displayed so all required fields are completed and come back to bills page", async () => {

      file = new File(['test'], billData.fileName, {type: 'image/jpeg'});

      fireEvent.change(expenseTypeInput, { target: { value: billData.type } });
      fireEvent.change(datePickerInput, { target: { value: billData.date } });
      fireEvent.change(amountInput, { target: { value: billData.amount } });
      fireEvent.change(pctInput, { target: { value: billData.pct } });
      userEvent.upload(fileInputLabel, file); 

      expect(expenseTypeInput).toBeValid();
      expect(datePickerInput).toBeValid();
      expect(amountInput).toBeValid();
      expect(pctInput).toBeValid();
      expect(fileInput.files[0]).toBeTruthy();
      
      fireEvent.submit(billForm);
      
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    })
  })
})

// test d'intégration POST NewBill
describe('Given I am connected as an employee ', () => {
  describe('When I am on NewBill Page', () => {

    let fileInput, onNavigate, newBill ;

    beforeAll(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employe',
        email : 'employe@test.tld'
      }))
    })

    beforeEach(() => {
      jest.spyOn(mockedStore, "bills");
      document.body.innerHTML = NewBillUI()
      onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      newBill = new NewBill({
        document, onNavigate, store: mockedStore, localStorage: window.localStorage
      })
      fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", newBill.handleChangeFile);
    })

    afterEach(() => {
      document.body.innerHTML = "";
      jest.restoreAllMocks();
    })

    test('Then the bill should not be acepted on API if the file is not an image', async () => {
      
      const file = new File(['test'], 'test.pdf', {type: 'application/pdf'});
      userEvent.upload(fileInput, file, {applyAccept: false}); 

      await waitFor(() => expect(newBill.fileUrl).toBeNull());
      await waitFor(() => expect(newBill.billId).toBeNull());
      
    })

    test('Then the bill should be acepted on API if the file is an image', async () => {
      const file = new File(['test'], 'https://localhost:3456/images/test.jpg', {type: 'image/jpeg'});
      userEvent.upload(fileInput, file);
      
      await waitFor(() => expect(newBill.fileUrl).toBe('https://localhost:3456/images/test.jpg'));
      await waitFor(() => expect(newBill.billId).toBe('1234'));
    })

    //Post integration tests
    describe('When an error occurs on API', () => {
      let file;
  
      beforeEach(() => {
        console.error = jest.fn();
        file = new File(['test'], 'https://localhost:3456/images/test.jpg', {type: 'image/jpeg'});
      });
  
      test('POST bills on API and fails with 400 message error', async () => {
        mockedStore.bills.mockImplementationOnce(() => {
          return {
            create: jest.fn().mockRejectedValue(new Error("Erreur 400"))
          }
        });

        userEvent.upload(fileInput, file);
        await new Promise(process.nextTick);
        
        expect(`${console.error.mock.calls[0][0]}`).toContain('Erreur 400');
      })

      test('POST bills on API and fails with 500 message error', async () => {
        mockedStore.bills.mockImplementationOnce(() => {
          return {
            create: jest.fn().mockRejectedValue(new Error("Erreur 500"))
          }
        });

        userEvent.upload(fileInput, file);
        await new Promise(process.nextTick);
        
        expect(`${console.error.mock.calls[0][0]}`).toContain('Erreur 500');
      })
    })
  })
})
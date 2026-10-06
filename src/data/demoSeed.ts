import backpackImg from '../assets/images/item_nike_backpack_1791243248802.jpg';
import calculatorImg from '../assets/images/item_casio_calculator_1791243259565.jpg';
import airpodsImg from '../assets/images/item_airpods_case_1791243268148.jpg';
import bottleImg from '../assets/images/item_water_bottle_1791243279308.jpg';
import { FoundItem, FoundItemPrivate } from '../types/models';

export interface SeedItemBundle {
  publicItem: Omit<FoundItem, 'createdAt' | 'updatedAt' | 'reporterId'>;
  privateData: Omit<FoundItemPrivate, 'createdAt' | 'updatedAt'>;
}

export const INITIAL_DEMO_FOUND_ITEMS: SeedItemBundle[] = [
  {
    publicItem: {
      id: 'found_nike_backpack_01',
      title: 'Black Nike Backpack',
      category: 'Bags',
      generalDescription:
        'Matte black Nike campus daypack with dual zippered compartments and padded shoulder straps. Found near the second-floor reading tables.',
      color: 'Black',
      brand: 'Nike',
      model: 'Brasilia 9.5',
      publicCharacteristics: 'Small red woven keychain tag attached to the front zipper pull.',
      locationFound: 'Library',
      dateFound: 'October 3, 2026',
      timeFound: '16:45',
      dateSubmittedToOffice: 'October 3, 2026',
      status: 'IN LOST & FOUND OFFICE',
      custodyState: 'AT_OFFICE',
      photoUrl: backpackImg,
      verificationQuestion:
        'What specific item or notebook title is inside the front mesh pocket, or what text is written on the red keychain?',
    },
    privateData: {
      itemId: 'found_nike_backpack_01',
      secretCharacteristics:
        'Keychain reads "FLIGHT CREW" on the reverse side; inside front pocket contains a blue Rhodia grid pad with "Algorithms & Data Structures - 2CS" written on page 1.',
      storageLocation: 'Shelf A-04 (Large Bags Section)',
      adminNotes: 'Turned in by library desk staff at closing.',
    },
  },
  {
    publicItem: {
      id: 'found_casio_calc_02',
      title: 'Silver Casio Scientific Calculator',
      category: 'Electronics',
      generalDescription:
        'Silver and black Casio ClassWiz scientific calculator with protective slide cover. Found after the morning lecture.',
      color: 'Silver',
      brand: 'Casio',
      model: 'fx-991EX ClassWiz',
      publicCharacteristics: 'Protective hard cover included; slight wear on the "=" key.',
      locationFound: 'Auditorium',
      dateFound: 'October 4, 2026',
      timeFound: '11:15',
      dateSubmittedToOffice: 'October 4, 2026',
      status: 'IN LOST & FOUND OFFICE',
      custodyState: 'AT_OFFICE',
      photoUrl: calculatorImg,
      verificationQuestion:
        'What initials or sticker are placed on the inside of the sliding protective cover?',
    },
    privateData: {
      itemId: 'found_casio_calc_02',
      secretCharacteristics:
        'Initials "Y.B. 1CP" scratched lightly inside the plastic slide case along with a small Tux Linux penguin sticker.',
      storageLocation: 'Cabinet B-12 (Electronics Tray 2)',
      adminNotes: 'Found in Auditorium A2, row 4.',
    },
  },
  {
    publicItem: {
      id: 'found_airpods_case_03',
      title: 'Black Silicone AirPods Case',
      category: 'Electronics',
      generalDescription:
        'Apple AirPods Pro charging case inside a matte black protective silicone sleeve with a metal carabiner.',
      color: 'Black',
      brand: 'Apple',
      model: 'AirPods Pro (2nd Gen)',
      publicCharacteristics: 'Matte black protective sleeve with dark gunmetal clip.',
      locationFound: 'Cafeteria',
      dateFound: 'October 4, 2026',
      timeFound: '13:30',
      dateSubmittedToOffice: 'October 4, 2026',
      status: 'IN LOST & FOUND OFFICE',
      custodyState: 'AT_OFFICE',
      photoUrl: airpodsImg,
      verificationQuestion:
        'Is there a custom engraving on the white inner charging case under the silicone sleeve, or any distinctive scratch?',
    },
    privateData: {
      itemId: 'found_airpods_case_03',
      secretCharacteristics:
        'Under the black silicone sleeve, the white Apple case has a custom engraving "M.H. 404" and a small diagonal scratch on the back hinge.',
      storageLocation: 'Safe Box S-02 (High-Value Electronics)',
      adminNotes: 'Charging case only (left earbud inside, right earbud missing).',
    },
  },
  {
    publicItem: {
      id: 'found_water_bottle_04',
      title: 'Navy Blue Insulated Water Bottle',
      category: 'Accessories',
      generalDescription:
        'Stainless steel vacuum-insulated water bottle in matte navy blue with a black loop cap.',
      color: 'Blue',
      brand: 'Hydro Flask',
      model: '24 oz Standard Mouth',
      publicCharacteristics: 'Matte navy finish with black sport cap.',
      locationFound: 'Laboratory',
      dateFound: 'October 2, 2026',
      timeFound: '15:20',
      dateSubmittedToOffice: 'October 2, 2026',
      status: 'IN LOST & FOUND OFFICE',
      custodyState: 'AT_OFFICE',
      photoUrl: bottleImg,
      verificationQuestion:
        'What sticker or dent is located near the bottom base of the bottle?',
    },
    privateData: {
      itemId: 'found_water_bottle_04',
      secretCharacteristics:
        'GDG Algiers holographic sticker on the bottom side and a small dent on the base rim.',
      storageLocation: 'Shelf C-09 (Personal Accessories)',
      adminNotes: 'Left in Network Lab L3.',
    },
  },
  {
    publicItem: {
      id: 'found_student_notebook_05',
      title: 'Spiral Grid Student Notebook',
      category: 'Books',
      generalDescription:
        'A4 hardcover spiral notebook with dark gray cover, containing handwritten lecture notes on Operating Systems and Architecture.',
      color: 'Gray',
      brand: 'Oxford',
      model: 'Europeanbook 1 A4+',
      publicCharacteristics: 'Dark gray polypropylene cover with twin-wire spiral binding.',
      locationFound: 'Classroom',
      dateFound: 'October 3, 2026',
      timeFound: '10:00',
      dateSubmittedToOffice: 'October 3, 2026',
      status: 'IN LOST & FOUND OFFICE',
      custodyState: 'AT_OFFICE',
      verificationQuestion:
        'What name, group number, or bookmark is inside the front cover of the notebook?',
    },
    privateData: {
      itemId: 'found_student_notebook_05',
      secretCharacteristics:
        'Group "2CS-SIQ G02" written in green ink on the inside cover; folded exam schedule tucked at page 42.',
      storageLocation: 'Shelf D-01 (Books & Documents)',
      adminNotes: 'Found in Room CP-07.',
    },
  },
  {
    publicItem: {
      id: 'found_gray_hoodie_06',
      title: 'Heather Gray Zip Hoodie',
      category: 'Clothing',
      generalDescription:
        'Medium-weight heather gray zip-up fleece hoodie left on the bleachers.',
      color: 'Gray',
      brand: 'Uniqlo',
      model: 'Full-Zip Hoodie',
      publicCharacteristics: 'Heather gray cotton fleece, metal zipper.',
      locationFound: 'Gym',
      dateFound: 'October 1, 2026',
      timeFound: '17:50',
      dateSubmittedToOffice: 'October 1, 2026',
      status: 'IN LOST & FOUND OFFICE',
      custodyState: 'AT_OFFICE',
      verificationQuestion:
        'What size is on the neck tag, and what small item was found in the right pocket?',
    },
    privateData: {
      itemId: 'found_gray_hoodie_06',
      secretCharacteristics:
        'Size L tag; right pocket had a blue Kingston 32GB USB flash drive and a cafeteria ticket.',
      storageLocation: 'Rack E-03 (Apparel)',
      adminNotes: 'Cleaned and tagged.',
    },
  },
  {
    publicItem: {
      id: 'found_usbc_charger_07',
      title: '65W USB-C Laptop Charger',
      category: 'Electronics',
      generalDescription:
        'White 65W USB-C power adapter with braided USB-C cable and Velcro cable tie.',
      color: 'White',
      brand: 'Anker',
      model: 'Nano II 65W',
      publicCharacteristics: 'Compact power block with braided USB-C to USB-C cable.',
      locationFound: 'Library',
      dateFound: 'October 5, 2026',
      timeFound: '09:40',
      dateSubmittedToOffice: 'October 5, 2026',
      status: 'IN LOST & FOUND OFFICE',
      custodyState: 'AT_OFFICE',
      verificationQuestion:
        'What color is the Velcro cable tie or tape wrapped around the connector end?',
    },
    privateData: {
      itemId: 'found_usbc_charger_07',
      secretCharacteristics:
        'Yellow electrical tape wrapped twice near the USB-C plug tip; serial ends in 89B.',
      storageLocation: 'Cabinet B-14 (Chargers & Cables)',
      adminNotes: 'Unplugged from quiet study booth #6.',
    },
  },
  {
    publicItem: {
      id: 'found_keys_set_08',
      title: 'Set of 3 Keys on Lanyard',
      category: 'Keys',
      generalDescription:
        'Three brass and silver keys attached to a short dark blue woven wrist strap.',
      color: 'Silver',
      brand: 'Bricard',
      model: 'Standard Cylinder Keys',
      publicCharacteristics: 'Dark blue wrist lanyard with metal split ring.',
      locationFound: 'Parking area',
      dateFound: 'October 4, 2026',
      timeFound: '14:10',
      dateSubmittedToOffice: 'October 4, 2026',
      status: 'IN LOST & FOUND OFFICE',
      custodyState: 'AT_OFFICE',
      verificationQuestion:
        'What small charm or plastic tag color is attached to the key ring alongside the 3 keys?',
    },
    privateData: {
      itemId: 'found_keys_set_08',
      secretCharacteristics:
        'Includes a small green plastic RFID dorm fob numbered #308 and a mini metallic Eiffel tower charm.',
      storageLocation: 'Key Hook Board K-05',
      adminNotes: 'Found near main campus gate walkway.',
    },
  },
];

var express = require('express');
var app = express();
import { render } from "preact-render-to-string";
import { renderStylesToString } from "emotion-server";
import { BacaPage, CekiPage } from "./pages";
import { BacaHtmlPage } from "./pages/questionBaca.js";
import { CekiHtmlPage } from "./pages/questionCeki.js";
const https = require('https');
var path = require('path');

const renderPageBaca = (header, json, page) => {
    return BacaHtmlPage({ header, json, content: renderStylesToString(render(page)) });
};
const renderPage = (header, json, page) => {
    return CekiHtmlPage({ header, json, content: renderStylesToString(render(page)) });
};

app.get('/:id', function(req, res) {
    if (req.params.id === 'favicon.ico') return;
   
    if (id == "B97F7Eba-9B7F-BA02-69F1-15498CBBB3D0") {
        var json = {
            locale: "id",
            completedHtmlOnCondition: [{
                expression: "{6. do you sell products? } = 'Tidak, saya tidak pernah menjual'",
                html: "Terima kasih Anda telah mengisi survey berikut."
            }],
            pages: [{
                name: "page1",
                elements: [{
                        type: "radiogroup",
                        name: "1. How old are you? ",
                        title: "我是baca的问卷",
                        isRequired: true,
                        choices: [{
                                value: "15-17  ",
                                text: "15-17  "
                            },
                            {
                                value: "18-22  ",
                                text: "18-22  "
                            },
                            {
                                value: "23-25 ",
                                text: "23-25 "
                            },
                            {
                                value: "26-35 ",
                                text: "26-35 "
                            },
                            {
                                value: "36-45  ",
                                text: "36-45  "
                            },
                            {
                                value: "above 45",
                                text: "lebih dari 45"
                            }
                        ]
                    },
                    {
                        type: "radiogroup",
                        name: "2. What’s your gender? ",
                        title: "Apa jenis kelamin Anda? ",
                        isRequired: true,
                        choices: [{
                                value: "male",
                                text: "Pria"
                            },
                            {
                                value: "Female",
                                text: "Wanita"
                            }
                        ]
                    },
                    {
                        type: "radiogroup",
                        name: "your marital status ? ",
                        title: "Apakah status pernikahan Anda? ",
                        isRequired: true,
                        choices: [{
                                value: "single              ",
                                text: "single              "
                            },
                            {
                                value: "married without child",
                                text: "Menikah belum memiliki Anak"
                            },
                            {
                                value: "married with children",
                                text: "Menikah sudah memiliki Anak"
                            }
                        ]
                    },
                    {
                        type: "radiogroup",
                        name: "4. Which city do you live in now? ",
                        title: "Sebutkan kota tempat Anda tinggal saat ini? ",
                        description: "satu pilihan jawaban saja",
                        isRequired: true,
                        hasOther: true,
                        otherPlaceHolder: "lainnya (tuliskan)",
                        choices: [{
                                value: "Jakarta",
                                text: "Jakarta"
                            },
                            {
                                value: "Bandung",
                                text: "Bandung"
                            },
                            {
                                value: "Bogor",
                                text: "Bogor"
                            },
                            {
                                value: "Tangerang",
                                text: "Tangerang"
                            },
                            {
                                value: "Banten",
                                text: "Banten"
                            },
                            {
                                value: "Bekasi",
                                text: "Bekasi"
                            },
                            {
                                value: "Medan",
                                text: "Medan"
                            },
                            {
                                value: "Surabaya",
                                text: "Surabaya"
                            },
                            {
                                value: "Semarang",
                                text: "Semarang"
                            },
                            {
                                value: "Makassar",
                                text: "Makassar"
                            }
                        ],
                        otherText: "lainnya (tuliskan)"
                    },
                    {
                        type: "radiogroup",
                        name: "5. What’s your occupation? ",
                        title: "Apa pekerjaan Anda? ",
                        description: "satu pilihan jawaban saja",
                        isRequired: true,
                        hasOther: true,
                        otherPlaceHolder: "lainnya (tuliskan)",
                        choices: [{
                                value: "merchant",
                                text: "Pedagang"
                            },
                            {
                                value: "Freelancerr / pekerja lepas",
                                text: "Freelancer / pekerja lepas"
                            },
                            {
                                value: "office clerk",
                                text: "Pekerja kantoran"
                            },
                            {
                                value: "house wife",
                                text: "Ibu Rumah Tangga"
                            },
                            {
                                value: "student",
                                text: "Pelajar / Mahasiswa"
                            },
                            {
                                value: "factory worker",
                                text: "Pekerja pabrik"
                            }
                        ],
                        otherText: "lainnya (tuliskan)"
                    },
                    {
                        type: "radiogroup",
                        name: "6. do you sell products? ",
                        title: "Apakah Anda menjual produk? ",
                        description: "satu pilihan jawaban saja",
                        isRequired: true,
                        choices: [{
                                value: "yes，sell",
                                text: "Ya, saya menjual produk"
                            },
                            {
                                value: "No，dont sell",
                                text: "Tidak, saya tidak pernah menjual"
                            }
                        ]
                    },
                    {
                        type: "radiogroup",
                        name: "7.You have been selling products for how long time？",
                        visible: false,
                        visibleIf: "{6. do you sell products? } = 'yes，sell'",
                        title: "Berapa lama Anda telah menjual produk？",
                        description: "satu pilihan jawaban saja",
                        isRequired: true,
                        choices: [{
                                value: " ＜6 months",
                                text: "kurang dari 6 bulan"
                            },
                            {
                                value: "6-12 months",
                                text: "6 bulan --- 12 bulan"
                            },
                            {
                                value: "1-3 years",
                                text: "1 tahun --- 3 tahun"
                            },
                            {
                                value: "3+ years",
                                text: "Lebih dari 3 tahun"
                            }
                        ]
                    },
                    {
                        type: "checkbox",
                        name: "8. What kind of product do you sell?",
                        visible: false,
                        visibleIf: "{6. do you sell products? } = 'yes，sell'",
                        title: "Produk apa saja yang Anda jual? ",
                        description: "dapat memilih beberapa jawaban",
                        isRequired: true,
                        hasOther: true,
                        otherPlaceHolder: "lainnya (tuliskan)",
                        choices: [{
                                value: "cloths& shoes & hats",
                                text: "Pakaian & sepatu & topi"
                            },
                            {
                                value: "cosmetic & skin care",
                                text: "kosmetik & perawatan kulit "
                            },
                            {
                                value: "Bags & Fashion Accessories",
                                text: "Tas & Aksesori fesyen "
                            },
                            {
                                value: "Housewares",
                                text: "Peralatan Rumah Tangga"
                            },
                            {
                                value: "Gadget",
                                text: "Gadget"
                            },
                            {
                                value: "Food and drink",
                                text: "Makanan dan minuman"
                            },
                            {
                                value: "Mother & baby products",
                                text: "Produk ibu & bayi"
                            },
                            {
                                value: "automotive & parts",
                                text: "Otomotif / suku cadang"
                            },
                            {
                                value: "Game (accounts/currency/equipment)",
                                text: "Game (akun, mata uang, peralatan, dll.)"
                            }
                        ],
                        otherText: "lainnya (tuliskan)"
                    },
                    {
                        type: "checkbox",
                        name: "9. Where do you get the products you sell?",
                        visible: false,
                        visibleIf: "{6. do you sell products? } = 'yes，sell'",
                        title: "Di mana Anda mendapatkan produk yang Anda jual?",
                        description: "dapat memilih beberapa jawaban",
                        isRequired: true,
                        hasOther: true,
                        otherPlaceHolder: "Lainnya (tuliskan)",
                        choices: [{
                                value: "friends and family",
                                text: "teman dan anggota keluarga"
                            },
                            {
                                value: "Local vendor",
                                text: "Penjual lokal (grosir / agen / distributor)"
                            },
                            {
                                value: "Self-made products",
                                text: "Produk buatan sendiri"
                            },
                            {
                                value: "Apps",
                                text: "Aplikasi"
                            }
                        ],
                        otherText: "Lainnya (tuliskan)"
                    },
                    {
                        type: "checkbox",
                        name: "10.Which app do you get the products from?",
                        visible: false,
                        visibleIf: "{9. Where do you get the products you sell?} contains 'Apps'",
                        title: "Sebutkan dari aplikasi mana Anda mendapatkan produk ini?",
                        description: "dapat memilih beberapa jawaban",
                        isRequired: true,
                        requiredIf: "{9. Where do you get the products you sell?} = ['Aplikasi']",
                        hasOther: true,
                        otherPlaceHolder: "Lainnya (tuliskan)",
                        choices: [{
                                value: "Facebook / IG / Twitter",
                                text: "Facebook / IG / Twitter"
                            },
                            {
                                value: "Whatsapp",
                                text: "Whatsapp"
                            },
                            {
                                value: "FB Messager / Line / telegram",
                                text: "FB Messager / Line / telegram"
                            },
                            {
                                value: "Tokopedia / Lazada / Shopee / Bukalapak / Blibli / JD.id",
                                text: "Tokopedia / Lazada / Shopee / Bukalapak / Blibli / JD.id"
                            },
                            {
                                value: "Meesho / Evermos",
                                text: "Meesho / Evermos"
                            }
                        ],
                        otherText: "Lainnya (tuliskan)"
                    },
                    {
                        type: "checkbox",
                        name: "11. Who do you sell your product to？",
                        visible: false,
                        visibleIf: "{6. do you sell products? } = 'yes，sell'",
                        title: "Kepada siapa Anda menjual produk Anda？",
                        description: "dapat memilih beberapa jawaban",
                        isRequired: true,
                        hasOther: true,
                        otherPlaceHolder: "Lainnya (tuliskan)",
                        choices: [{
                                value: "friends and family",
                                text: "teman dan anggota keluarga"
                            },
                            {
                                value: "neighbor",
                                text: "tetangga"
                            },
                            {
                                value: "classmates or colleagues",
                                text: "teman sekelas atau rekan kerja"
                            },
                            {
                                value: "WA contacts ",
                                text: "Kontak di Whatsapp Anda"
                            },
                            {
                                value: "Social Media followers",
                                text: "Teman / follower di Facebook / IG / Twitter"
                            },
                            {
                                value: "Tiktok",
                                text: "Teman / follower di Tiktok"
                            },
                            {
                                value: "physical customer",
                                text: "orang yang datang ke toko saya"
                            },
                            {
                                value: "e-commerce",
                                text: "Tokopedia / Lazada / Shopee / Bukalapak / Blibli / JD.id"
                            }
                        ],
                        otherText: "Lainnya (tuliskan)"
                    },
                    {
                        type: "checkbox",
                        name: "12. How do you contact with you customer? ",
                        visible: false,
                        visibleIf: "{6. do you sell products? } = 'yes，sell'",
                        title: "Bagaimana Anda berkomunikasi dengan konsumen Anda? ",
                        description: "dapat memilih beberapa jawaban",
                        isRequired: true,
                        hasOther: true,
                        otherPlaceHolder: "Lainnya (tuliskan)",
                        choices: [{
                                value: "Whatsapp",
                                text: "Whatsapp"
                            },
                            {
                                value: "DM e-commerce",
                                text: "DM dalam Tokopedia / Lazada / Shopee / Bukalapak / Blibli / JD.id"
                            },
                            {
                                value: "DM social media",
                                text: "DM di Facebook / IG / twitter"
                            },
                            {
                                value: "FB Messenger",
                                text: "FB Messenger"
                            },
                            {
                                value: "Telegram",
                                text: "Telegram"
                            },
                            {
                                value: "Line",
                                text: "Line"
                            },
                            {
                                value: "Face to face",
                                text: "Tatap muka"
                            }
                        ],
                        otherText: "Lainnya (tuliskan)"
                    },
                    {
                        type: "radiogroup",
                        name: "13. How much do you earn from selling products per month? ",
                        visible: false,
                        visibleIf: "{6. do you sell products? } = 'yes，sell'",
                        title: "Berapa banyak uang yang Anda hasilkan per bulan dari menjual produk? ",
                        description: "satu pilihan jawaban saja",
                        isRequired: true,
                        choices: [{
                                value: "below 200.000",
                                text: "kurang dari 200.000"
                            },
                            {
                                value: "200.000 --- 500.000",
                                text: "200.000 --- 500.000"
                            },
                            {
                                value: "500.000 --- 1.000.000",
                                text: "500.000 --- 1.000.000"
                            },
                            {
                                value: "1.000.000 --- 5.000.000",
                                text: "1.000.000 --- 5.000.000"
                            },
                            {
                                value: "5.000.000 +",
                                text: "5.000.000 +"
                            }
                        ]
                    },
                    {
                        type: "comment",
                        name: "baca users version of ending",
                        title: "Terima kasih telah mengisi survei! \nKami saat ini menawarkan aplikasi bernama \"CekiCeki\" untuk penjual / reseller online, Anda dapat memperoleh komisi dengan berbagi informasi mengenai suatu produk kepada orang lain, tidak perlu menyimpan stok barang, langkah yang mudah, dan waktu kerja yang fleksibel. \n \n\nJika Anda ingin bergabung secara gratis dan mendapatkan uang dengan mudah di rumah, silakan tuliskan nomor WhatsApp Anda dan staf kami akan segera menghubungi Anda.\n\n",
                        description: "Jika Anda ingin mengenal aplikasi kami terlebih dahulu, Anda dapat mengunduh dari tautan berikut: https://play.google.com/store/apps/details?id=com.cari.promo.diskon",
                        placeHolder: "Nomor WhatsApp"
                    }
                ],
                title: "Selamat datang di sruvey kami, silahkan mengisi dengan benar dan lengkap, agar kami bisa mendapatkan informasi yang benar mengenai Anda dan preferensi Anda"
            }],
            triggers: [{
                type: "complete",
                expression: "{6. do you sell products? } = 'Tidak, saya tidak pernah menjual'"
            }]
        }
        res.send(renderPageBaca(JSON.stringify(header), JSON.stringify(json), BacaPage()));

    } else if (id == "B97F7Ece-9B7F-BA02-69F1-15498CBBB3D0") {
        var json = {
            locale: "id",
            completedHtmlOnCondition: [{
                expression: "{6. do you sell products? } = 'Tidak, saya tidak pernah menjual'",
                html: "Terima kasih Anda telah mengisi survey berikut."
            }],
            pages: [{
                name: "page1",
                elements: [{
                        type: "radiogroup",
                        name: "1. How old are you? ",
                        title: "我是ceki的问卷 ",
                        isRequired: true,
                        choices: [{
                                value: "15-17  ",
                                text: "15-17  "
                            },
                            {
                                value: "18-22  ",
                                text: "18-22  "
                            },
                            {
                                value: "23-25 ",
                                text: "23-25 "
                            },
                            {
                                value: "26-35 ",
                                text: "26-35 "
                            },
                            {
                                value: "36-45  ",
                                text: "36-45  "
                            },
                            {
                                value: "above 45",
                                text: "lebih dari 45"
                            }
                        ]
                    },
                    {
                        type: "radiogroup",
                        name: "2. What’s your gender? ",
                        title: "Apa jenis kelamin Anda? ",
                        isRequired: true,
                        choices: [{
                                value: "male",
                                text: "Pria"
                            },
                            {
                                value: "Female",
                                text: "Wanita"
                            }
                        ]
                    },
                    {
                        type: "radiogroup",
                        name: "your marital status ? ",
                        title: "Apakah status pernikahan Anda? ",
                        isRequired: true,
                        choices: [{
                                value: "single              ",
                                text: "single              "
                            },
                            {
                                value: "married without child",
                                text: "Menikah belum memiliki Anak"
                            },
                            {
                                value: "married with children",
                                text: "Menikah sudah memiliki Anak"
                            }
                        ]
                    },
                    {
                        type: "radiogroup",
                        name: "4. Which city do you live in now? ",
                        title: "Sebutkan kota tempat Anda tinggal saat ini? ",
                        description: "satu pilihan jawaban saja",
                        isRequired: true,
                        hasOther: true,
                        otherPlaceHolder: "lainnya (tuliskan)",
                        choices: [{
                                value: "Jakarta",
                                text: "Jakarta"
                            },
                            {
                                value: "Bandung",
                                text: "Bandung"
                            },
                            {
                                value: "Bogor",
                                text: "Bogor"
                            },
                            {
                                value: "Tangerang",
                                text: "Tangerang"
                            },
                            {
                                value: "Banten",
                                text: "Banten"
                            },
                            {
                                value: "Bekasi",
                                text: "Bekasi"
                            },
                            {
                                value: "Medan",
                                text: "Medan"
                            },
                            {
                                value: "Surabaya",
                                text: "Surabaya"
                            },
                            {
                                value: "Semarang",
                                text: "Semarang"
                            },
                            {
                                value: "Makassar",
                                text: "Makassar"
                            }
                        ],
                        otherText: "lainnya (tuliskan)"
                    },
                    {
                        type: "radiogroup",
                        name: "5. What’s your occupation? ",
                        title: "Apa pekerjaan Anda? ",
                        description: "satu pilihan jawaban saja",
                        isRequired: true,
                        hasOther: true,
                        otherPlaceHolder: "lainnya (tuliskan)",
                        choices: [{
                                value: "merchant",
                                text: "Pedagang"
                            },
                            {
                                value: "Freelancerr / pekerja lepas",
                                text: "Freelancer / pekerja lepas"
                            },
                            {
                                value: "office clerk",
                                text: "Pekerja kantoran"
                            },
                            {
                                value: "house wife",
                                text: "Ibu Rumah Tangga"
                            },
                            {
                                value: "student",
                                text: "Pelajar / Mahasiswa"
                            },
                            {
                                value: "factory worker",
                                text: "Pekerja pabrik"
                            }
                        ],
                        otherText: "lainnya (tuliskan)"
                    },
                    {
                        type: "radiogroup",
                        name: "6. do you sell products? ",
                        title: "Apakah Anda menjual produk? ",
                        description: "satu pilihan jawaban saja",
                        isRequired: true,
                        choices: [{
                                value: "yes，sell",
                                text: "Ya, saya menjual produk"
                            },
                            {
                                value: "No，dont sell",
                                text: "Tidak, saya tidak pernah menjual"
                            }
                        ]
                    },
                    {
                        type: "radiogroup",
                        name: "7.You have been selling products for how long time？",
                        visible: false,
                        visibleIf: "{6. do you sell products? } = 'yes，sell'",
                        title: "Berapa lama Anda telah menjual produk？",
                        description: "satu pilihan jawaban saja",
                        isRequired: true,
                        choices: [{
                                value: " ＜6 months",
                                text: "kurang dari 6 bulan"
                            },
                            {
                                value: "6-12 months",
                                text: "6 bulan --- 12 bulan"
                            },
                            {
                                value: "1-3 years",
                                text: "1 tahun --- 3 tahun"
                            },
                            {
                                value: "3+ years",
                                text: "Lebih dari 3 tahun"
                            }
                        ]
                    },
                    {
                        type: "checkbox",
                        name: "8. What kind of product do you sell?",
                        visible: false,
                        visibleIf: "{6. do you sell products? } = 'yes，sell'",
                        title: "Produk apa saja yang Anda jual? ",
                        description: "dapat memilih beberapa jawaban",
                        isRequired: true,
                        hasOther: true,
                        otherPlaceHolder: "lainnya (tuliskan)",
                        choices: [{
                                value: "cloths& shoes & hats",
                                text: "Pakaian & sepatu & topi"
                            },
                            {
                                value: "cosmetic & skin care",
                                text: "kosmetik & perawatan kulit "
                            },
                            {
                                value: "Bags & Fashion Accessories",
                                text: "Tas & Aksesori fesyen "
                            },
                            {
                                value: "Housewares",
                                text: "Peralatan Rumah Tangga"
                            },
                            {
                                value: "Gadget",
                                text: "Gadget"
                            },
                            {
                                value: "Food and drink",
                                text: "Makanan dan minuman"
                            },
                            {
                                value: "Mother & baby products",
                                text: "Produk ibu & bayi"
                            },
                            {
                                value: "automotive & parts",
                                text: "Otomotif / suku cadang"
                            },
                            {
                                value: "Game (accounts/currency/equipment)",
                                text: "Game (akun, mata uang, peralatan, dll.)"
                            }
                        ],
                        otherText: "lainnya (tuliskan)"
                    },
                    {
                        type: "checkbox",
                        name: "9. Where do you get the products you sell?",
                        visible: false,
                        visibleIf: "{6. do you sell products? } = 'yes，sell'",
                        title: "Di mana Anda mendapatkan produk yang Anda jual?",
                        description: "dapat memilih beberapa jawaban",
                        isRequired: true,
                        hasOther: true,
                        otherPlaceHolder: "Lainnya (tuliskan)",
                        choices: [{
                                value: "friends and family",
                                text: "teman dan anggota keluarga"
                            },
                            {
                                value: "Local vendor",
                                text: "Penjual lokal (grosir / agen / distributor)"
                            },
                            {
                                value: "Self-made products",
                                text: "Produk buatan sendiri"
                            },
                            {
                                value: "Apps",
                                text: "Aplikasi"
                            }
                        ],
                        otherText: "Lainnya (tuliskan)"
                    },
                    {
                        type: "checkbox",
                        name: "10.Which app do you get the products from?",
                        visible: false,
                        visibleIf: "{9. Where do you get the products you sell?} contains 'Apps'",
                        title: "Sebutkan dari aplikasi mana Anda mendapatkan produk ini?",
                        description: "dapat memilih beberapa jawaban",
                        isRequired: true,
                        requiredIf: "{9. Where do you get the products you sell?} = ['Aplikasi']",
                        hasOther: true,
                        otherPlaceHolder: "Lainnya (tuliskan)",
                        choices: [{
                                value: "Facebook / IG / Twitter",
                                text: "Facebook / IG / Twitter"
                            },
                            {
                                value: "Whatsapp",
                                text: "Whatsapp"
                            },
                            {
                                value: "FB Messager / Line / telegram",
                                text: "FB Messager / Line / telegram"
                            },
                            {
                                value: "Tokopedia / Lazada / Shopee / Bukalapak / Blibli / JD.id",
                                text: "Tokopedia / Lazada / Shopee / Bukalapak / Blibli / JD.id"
                            },
                            {
                                value: "Meesho / Evermos",
                                text: "Meesho / Evermos"
                            }
                        ],
                        otherText: "Lainnya (tuliskan)"
                    },
                    {
                        type: "checkbox",
                        name: "11. Who do you sell your product to？",
                        visible: false,
                        visibleIf: "{6. do you sell products? } = 'yes，sell'",
                        title: "Kepada siapa Anda menjual produk Anda？",
                        description: "dapat memilih beberapa jawaban",
                        isRequired: true,
                        hasOther: true,
                        otherPlaceHolder: "Lainnya (tuliskan)",
                        choices: [{
                                value: "friends and family",
                                text: "teman dan anggota keluarga"
                            },
                            {
                                value: "neighbor",
                                text: "tetangga"
                            },
                            {
                                value: "classmates or colleagues",
                                text: "teman sekelas atau rekan kerja"
                            },
                            {
                                value: "WA contacts ",
                                text: "Kontak di Whatsapp Anda"
                            },
                            {
                                value: "Social Media followers",
                                text: "Teman / follower di Facebook / IG / Twitter"
                            },
                            {
                                value: "Tiktok",
                                text: "Teman / follower di Tiktok"
                            },
                            {
                                value: "physical customer",
                                text: "orang yang datang ke toko saya"
                            },
                            {
                                value: "e-commerce",
                                text: "Tokopedia / Lazada / Shopee / Bukalapak / Blibli / JD.id"
                            }
                        ],
                        otherText: "Lainnya (tuliskan)"
                    },
                    {
                        type: "checkbox",
                        name: "12. How do you contact with you customer? ",
                        visible: false,
                        visibleIf: "{6. do you sell products? } = 'yes，sell'",
                        title: "Bagaimana Anda berkomunikasi dengan konsumen Anda? ",
                        description: "dapat memilih beberapa jawaban",
                        isRequired: true,
                        hasOther: true,
                        otherPlaceHolder: "Lainnya (tuliskan)",
                        choices: [{
                                value: "Whatsapp",
                                text: "Whatsapp"
                            },
                            {
                                value: "DM e-commerce",
                                text: "DM dalam Tokopedia / Lazada / Shopee / Bukalapak / Blibli / JD.id"
                            },
                            {
                                value: "DM social media",
                                text: "DM di Facebook / IG / twitter"
                            },
                            {
                                value: "FB Messenger",
                                text: "FB Messenger"
                            },
                            {
                                value: "Telegram",
                                text: "Telegram"
                            },
                            {
                                value: "Line",
                                text: "Line"
                            },
                            {
                                value: "Face to face",
                                text: "Tatap muka"
                            }
                        ],
                        otherText: "Lainnya (tuliskan)"
                    },
                    {
                        type: "radiogroup",
                        name: "13. How much do you earn from selling products per month? ",
                        visible: false,
                        visibleIf: "{6. do you sell products? } = 'yes，sell'",
                        title: "Berapa banyak uang yang Anda hasilkan per bulan dari menjual produk? ",
                        description: "satu pilihan jawaban saja",
                        isRequired: true,
                        choices: [{
                                value: "below 200.000",
                                text: "kurang dari 200.000"
                            },
                            {
                                value: "200.000 --- 500.000",
                                text: "200.000 --- 500.000"
                            },
                            {
                                value: "500.000 --- 1.000.000",
                                text: "500.000 --- 1.000.000"
                            },
                            {
                                value: "1.000.000 --- 5.000.000",
                                text: "1.000.000 --- 5.000.000"
                            },
                            {
                                value: "5.000.000 +",
                                text: "5.000.000 +"
                            }
                        ]
                    },
                    {
                        type: "comment",
                        name: "baca users version of ending",
                        title: "Terima kasih telah mengisi survei! \nKami saat ini menawarkan aplikasi bernama \"CekiCeki\" untuk penjual / reseller online, Anda dapat memperoleh komisi dengan berbagi informasi mengenai suatu produk kepada orang lain, tidak perlu menyimpan stok barang, langkah yang mudah, dan waktu kerja yang fleksibel. \n \n\nJika Anda ingin bergabung secara gratis dan mendapatkan uang dengan mudah di rumah, silakan tuliskan nomor WhatsApp Anda dan staf kami akan segera menghubungi Anda.\n\n",
                        description: "Jika Anda ingin mengenal aplikasi kami terlebih dahulu, Anda dapat mengunduh dari tautan berikut: https://play.google.com/store/apps/details?id=com.cari.promo.diskon",
                        placeHolder: "Nomor WhatsApp"
                    }
                ],
                title: "Selamat datang di sruvey kami, silahkan mengisi dengan benar dan lengkap, agar kami bisa mendapatkan informasi yang benar mengenai Anda dan preferensi Anda"
            }],
            triggers: [{
                type: "complete",
                expression: "{6. do you sell products? } = 'Tidak, saya tidak pernah menjual'"
            }]
        }
        res.send(renderPage(JSON.stringify(header), JSON.stringify(json), CekiPage()));

    }
})

const port = process.env.PORT || 3000;

var server = app.listen(port, function() {
    console.log("Server running at http://localhost:%d", port);
})
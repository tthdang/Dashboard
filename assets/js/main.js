
//get revenue
var revenueApi = 'http://localhost:9090/getRevenue';
function start() {
  getRevenue(function (revenue) {
    //console.log(revenue);
    document.getElementById('revenue').innerText = revenue;
  });

}
start();
function getRevenue(callback) {
  fetch(revenueApi)
    .then(function (response) {
      return response.json();
    })
    .then(callback);
}
// end revenue

// ham lay danh sach san pham ban chay
async function
  fetchTop5Products() {
  try {
    const response = await fetch("http://localhost:9090/getTop5");
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

function displayProducts(products) {
  const tableBody = document.querySelector("#productsTable tbody");
  tableBody.innerHTML = "";

  products.forEach(product => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.price.toLocaleString()} VND</td>
                    <td>${product.quantity}</td>
                    <td>${product.total.toLocaleString()} VND</td>
                `;

    tableBody.appendChild(row);
  });
}
fetchTop5Products();
//end san pham ban chay

// lay so luong san pham
async function fetchAndDisplayTotalQuantity() {
  try {
    const response = await fetch('http://localhost:9090/getQuantity');
    const data = await response.json();
    const totalQuantityElement = document.getElementById('Total');
    totalQuantityElement.innerText = `${data.totalQuantity}`;
  } catch (error) {
    console.error('Error fetching the total quantity:', error);
  }
}
fetchAndDisplayTotalQuantity();
// end lay so luong san pham



// them san pham moi
// Function to handle adding a product




///phan trang va hien thi danh sách sản phẩm, xóa sản phẩm
document.addEventListener('DOMContentLoaded', function () {
  const productList = document.getElementById('product_list').querySelector('tbody');
  const pagination = document.getElementById('pagination');
  const itemsPerPage = 10;
  let currentPage = 1;
  let products = [];

  // Hàm để lấy dữ liệu từ API
  async function fetchProducts() {
    try {
      const response = await fetch('http://localhost:9090/getProducts');
      const data = await response.json();
      products = data;
      displayProducts();
      setupPagination();
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  // Hàm để hiển thị sản phẩm lên bảng
  function displayProducts() {
    productList.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = products.slice(start, end);

    paginatedItems.forEach(product => {
      const row = document.createElement('tr');

      const cellId = document.createElement('td');
      cellId.textContent = product.id;
      row.appendChild(cellId);

      const cellImg = document.createElement('td');
      const img = document.createElement('img');
      img.src = product.imgFileName;
      img.alt = product.name;
      img.style.width = '100px'; // Đặt kích thước ảnh cho phù hợp
      cellImg.appendChild(img);
      row.appendChild(cellImg);

      const cellName = document.createElement('td');
      cellName.textContent = product.name;
      row.appendChild(cellName);

      const cellPrice = document.createElement('td');
      cellPrice.textContent = `${product.price} VND`;
      row.appendChild(cellPrice);

      const cellStock = document.createElement('td');
      cellStock.textContent = product.stock;
      row.appendChild(cellStock);

      const cellActions = document.createElement('td');
      const editButton = document.createElement('button');
      editButton.textContent = 'Chỉnh sửa';
      editButton.className = 'btn btn-warning btn-sm';
      editButton.addEventListener('click', function () {
        editProduct(product.id);
      });
      cellActions.appendChild(editButton);
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Xóa';
      deleteButton.className = 'btn btn-danger btn-sm';
      deleteButton.addEventListener('click', function () {
        deleteProduct(product.id);
      });
      cellActions.appendChild(deleteButton);
      row.appendChild(cellActions);

      productList.appendChild(row);
    });
  }

  // Hàm để thiết lập phân trang
  function setupPagination() {
    pagination.innerHTML = '';
    const pageCount = Math.ceil(products.length / itemsPerPage);

    for (let i = 1; i <= pageCount; i++) {
      const pageItem = document.createElement('li');
      pageItem.className = 'page-item';

      const pageLink = document.createElement('a');
      pageLink.className = 'page-link';
      pageLink.href = '#';
      pageLink.textContent = i;

      pageLink.addEventListener('click', function (event) {
        event.preventDefault();
        currentPage = i;
        displayProducts();
      });

      pageItem.appendChild(pageLink);
      pagination.appendChild(pageItem);
    }
  }

  //sua 
  async function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
      currentEditProductId = productId;
      document.getElementById('editName').value = product.name;
      document.getElementById('editPrice').value = product.price;
      document.getElementById('editStock').value = product.stock;
      document.getElementById('edit-product-form').classList.remove('d-none');
    }
  }

  async function deleteProduct(productId) {
    const confirmed = confirm('Bạn có chắc chắn muốn xóa sản phẩm này?');
    if (confirmed) {
      try {
        const response = await fetch(`http://localhost:9090/deleteProduct/${productId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          products = products.filter(p => p.id !== productId);
          displayProducts();
          setupPagination();
        } else {
          console.error('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  }

  // Gọi hàm để lấy dữ liệu từ API và hiển thị sản phẩm
  fetchProducts();
});
//end hien thi danh sách

//Hiện thị sản phẩm lọc theo giá

document.addEventListener('DOMContentLoaded', function () {
  const searchForm = document.getElementById('search-form');
  const searchResultTableBody = document.querySelector('#searchResultTable');
  const responseMessage = document.getElementById('response-message');
  const pagination = document.getElementById('pagination');

  searchForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Lấy giá trị từ input
    const minPriceInput = document.getElementById('minPrice').value;
    const maxPriceInput = document.getElementById('maxPrice').value;

    // Nếu không nhập, đặt giá trị mặc định
    const minPrice = minPriceInput ? parseFloat(minPriceInput) : null;
    const maxPrice = maxPriceInput ? parseFloat(maxPriceInput) : null;

    // Kiểm tra tính hợp lệ (minPrice phải <= maxPrice nếu cả hai đều tồn tại)
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      responseMessage.textContent = 'Giá thấp nhất không được lớn hơn giá cao nhất!';
      responseMessage.className = 'text-danger';
      return;
    }

    // Xây dựng URL API với minPrice và maxPrice có hoặc không có
    let apiUrl = 'http://localhost:9090/productPrice';
    if (minPrice !== null && minPrice !== undefined) apiUrl += `?minPrice=${minPrice}&`;
    if (maxPrice !== null && maxPrice !== undefined) apiUrl += `?maxPrice=${maxPrice}`;

    if (apiUrl.endsWith('&')) {
      apiUrl = apiUrl.slice(0, -1);
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Không thể kết nối đến API.');
      }

      const products = await response.json();
      displaySearchResults(products);

      if (products.length > 0) {
        responseMessage.textContent = `${products.length} sản phẩm được tìm thấy.`;
        responseMessage.className = 'text-success';
      } else {
        responseMessage.textContent = 'Không tìm thấy sản phẩm nào phù hợp.';
        responseMessage.className = 'text-warning';
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      responseMessage.textContent = 'Có lỗi xảy ra khi tìm kiếm sản phẩm.';
      responseMessage.className = 'text-danger';
    }


  });

  // Hàm hiển thị kết quả tìm kiếm
  function displaySearchResults(products) {
    searchResultTableBody.innerHTML = ''; // Xóa kết quả cũ

    products.forEach(product => {
      const row = document.createElement('tr');

      // const cellImg = document.createElement('td');
      // const img = document.createElement('img');
      // img.src = product.imgFileName;
      // img.alt = product.name;
      // img.style.width = '100px'; // Đặt kích thước ảnh cho phù hợp
      // cellImg.appendChild(img);
      // row.appendChild(cellImg);

      row.innerHTML = `
        <td>${product.id}</td>
        <td><img src="${product.imgFileName}" alt="${product.name}" style="width: 100px; height: auto;"></td>
        <td>${product.name}</td>
        <td>${product.price.toLocaleString()} VND</td>
        <td>${product.stock}</td>
      `;

      searchResultTableBody.appendChild(row);
    });

    //   // Hàm để thiết lập phân trang
    // function setupPagination() {
    //   pagination.innerHTML = '';
    //   const pageCount = Math.ceil(products.length / itemsPerPage);

    //   for (let i = 1; i <= pageCount; i++) {
    //     const pageItem = document.createElement('li');
    //     pageItem.className = 'page-item';

    //     const pageLink = document.createElement('a');
    //     pageLink.className = 'page-link';
    //     pageLink.href = '#';
    //     pageLink.textContent = i;

    //     pageLink.addEventListener('click', function (event) {
    //       event.preventDefault();
    //       currentPage = i;
    //       displayProducts();
    //     });

    //     pageItem.appendChild(pageLink);
    //     pagination.appendChild(pageItem);
    //   }
    // }

  }
});
//Kết thúc hiện thị lọc sản phẩm theo giá



// ham them moi 
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('add-product-form');
  const responseMessage = document.getElementById('response-message');

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Get form data
    const name = document.getElementById('name').value;
    const price = parseFloat(document.getElementById('price').value);
    const imgFileInput = document.getElementById('imgFile');
    const stock = parseInt(document.getElementById('stock').value);


    // Get the file name from the input
    const imgFileName = imgFileInput.files[0].name;

    // Create product object
    const product = {
      name: name,
      price: price,
      imgFileName: `//product.hstatic.net/200000783783/product/${imgFileName}`,
      stock: stock
    };

    try {
      // Send POST request to API
      const response = await fetch('http://localhost:9090/createProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      const result = await response.json();

      // Display response message
      if (response.ok) {
        responseMessage.textContent = 'Product added successfully!';
        responseMessage.className = 'text-success';
        form.reset(); // Reset the form
        setTimeout(() => {
          window.location.href = 'product.html';
        }, 1000);

      } else {
        responseMessage.textContent = `Error: ${result.message}`;
        responseMessage.className = 'text-danger';
      }
    } catch (error) {
      console.error('Error adding the product:', error);
      responseMessage.textContent = 'Error adding the product';
      responseMessage.className = 'text-danger';
    }
  });
});


//lay san pham moi trong thang
async function fetchNewProducts() {
  try {

    const response = await fetch('http://localhost:9090/getProductInMonth');
    const data = await response.json();

    const newProductElement = document.getElementById('newProduct');
    newProductElement.innerText = `${data.numberOfProducts}`;
  } catch (error) {
    console.error('Error fetching new products:', error);
  }
}
fetchNewProducts();

//login
function login() {

  <p id="message"></p>

  document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/auth/log-in", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password }),
      });


      if (response.ok) {
        // Chuyển hướng đến trang khác nếu đăng nhập thành công
        window.location.href = "/index.html";
      }
    } catch (error) {
      console.error("Lỗi:", error);
      document.getElementById("message").textContent = "Có lỗi xảy ra!";
    }
  });
}
















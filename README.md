# Demo
    - Sprint management: https://youtu.be/cdsXfCd1Muo
    - Backlog management: https://youtu.be/0v7TChLomc0
    - Conference: https://youtu.be/d1VeT39TiTs

# How to install

### Cài đặt NodeJS:

1. Khởi động Terminal của Ubuntu.
2. $``curl https://raw.githubusercontent.com/creationix/nvm/v0.11.1/install.sh | bash``
3. $``source ~/.profile``
4. $``sudo apt-get install git``
5. $``nvm install v0.10.13``
6. Kiểm tra đã cài đặt thành công hay chưa: $``node –v``
7. Nếu trên termial xuất hiện: ``node vx.xx.xx`` thì báo hiệu đã cài đặt NodeJS thành công.
8. Để NodeJS luôn chạy tự động: $``n=$(which node);n=${n%/bin/node}; chmod -R 755 $n/bin/*; sudo cp -r $n/{bin,lib,share} /usr/local``
9. Sau đó kiểm tra NodeJS đã chạy tự động hay chưa: $``which node``
10. Nếu trên terminal xuất hiện: ``/usr/local/bin/node`` thì báo hiệu rằng NodeJS đã chạy tự động với phiên bản v0.10.13.

### Cài đặt MongoDB:
1. $``sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10``
2. $``echo "deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen" | tee -a /etc/apt/sources.list.d/10gen.list``
3. $``apt-get -y update``
4. $``apt-get -y install mongodb-10gen``
5. $``sudo bash ./mongo_install.bash``
6. Nếu cài đặt thành công, trên terminal sẽ xuất hiện: ``mongodb start/running, process 2368``

### Cài đặt FFmpeg
1. $``sudo add-apt-repository ppa:jon-severinsson/ffmpeg``
2. $``sudo apt-get update``
3. $``sudo apt-get install ffmpeg``
4. $``sudo apt-get install frei0r-plugins``

### Cài đặt ứng dụng:
1. Di chuyển đến thư mục chứa ứng dụng
2. $``sudo apt-get install build-essential``
3. $``npm intsall``
4. Sau khi lệnh trên hoàn tất (không gặp lỗi). Tiếp tục $``grunt``
5. Lúc này, ứng dụng sẽ chạy trên địa chỉ:``localhost:3000`` hoặc ``127.0.0.1:3000``
6. Vào trình duyệt web và $địa chỉ trên. Nếu thành công, trình duyệt sẽ xuất hiện giao diện đăng $của ứng dụng.
7. Kết thúc.

### Refs:
1. https://www.digitalocean.com/community/tutorials/how-to-install-node-js-with-nvm-node-version-manager-on-a-vps
2. http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/
3. http://meanjs.org/docs.html
